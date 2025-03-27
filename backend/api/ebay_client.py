"""
eBay API Client
Handles authentication and API requests to eBay services
"""
import os
import logging
import json
from typing import Dict, Any, List, Optional
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class EbayClient:
    """Client for interacting with eBay APIs"""
    
    # eBay API endpoints
    SANDBOX_ENV = 'https://api.sandbox.ebay.com'
    PRODUCTION_ENV = 'https://api.ebay.com'
    
    # OAuth endpoints
    SANDBOX_OAUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
    PRODUCTION_OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token'
    
    def __init__(self, client_id: str = None, client_secret: str = None, 
                 refresh_token: str = None, sandbox: bool = False):
        """
        Initialize the eBay client with credentials
        
        Args:
            client_id: eBay API client ID
            client_secret: eBay API client secret
            refresh_token: OAuth refresh token
            sandbox: Whether to use sandbox environment
        """
        self.client_id = client_id or settings.EBAY_CLIENT_ID
        self.client_secret = client_secret or settings.EBAY_CLIENT_SECRET
        self.refresh_token = refresh_token or settings.EBAY_REFRESH_TOKEN
        self.sandbox = sandbox
        self.access_token = None
        self.token_expiry = 0
        
        # Set base URL based on environment
        self.base_url = self.SANDBOX_ENV if sandbox else self.PRODUCTION_ENV
        self.oauth_url = self.SANDBOX_OAUTH_URL if sandbox else self.PRODUCTION_OAUTH_URL
    
    def get_access_token(self) -> str:
        """
        Get a valid access token, refreshing if necessary
        
        Returns:
            str: Valid access token
        """
        import time
        
        # Check if token needs refresh
        if not self.access_token or time.time() >= self.token_expiry:
            self._refresh_access_token()
            
        return self.access_token
    
    def _refresh_access_token(self) -> None:
        """Refresh the OAuth access token"""
        import time
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {self._get_basic_auth_token()}'
        }
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': self.refresh_token,
            'scope': 'https://api.ebay.com/oauth/api_scope'
        }
        
        try:
            response = requests.post(self.oauth_url, headers=headers, data=data)
            response.raise_for_status()
            token_data = response.json()
            
            self.access_token = token_data['access_token']
            # Set expiry with a small buffer (5 minutes)
            self.token_expiry = time.time() + token_data['expires_in'] - 300
            
            logger.info("Successfully refreshed eBay access token")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to refresh eBay access token: {str(e)}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            raise
    
    def _get_basic_auth_token(self) -> str:
        """
        Create the Basic auth token for API authentication
        
        Returns:
            str: Base64 encoded auth token
        """
        import base64
        credentials = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(credentials.encode()).decode()
    
    def search_items(self, keywords: str, limit: int = 10, 
                    category_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Search for items on eBay
        
        Args:
            keywords: Search terms
            limit: Maximum number of results
            category_id: Optional category ID to filter by
            
        Returns:
            Dict containing search results
        """
        endpoint = '/buy/browse/v1/item_summary/search'
        
        params = {
            'q': keywords,
            'limit': limit
        }
        
        if category_id:
            params['category_ids'] = category_id
            
        return self._make_request('GET', endpoint, params=params)
    
    def get_item(self, item_id: str) -> Dict[str, Any]:
        """
        Get details for a specific eBay item
        
        Args:
            item_id: eBay item ID
            
        Returns:
            Dict containing item details
        """
        endpoint = f'/buy/browse/v1/item/{item_id}'
        return self._make_request('GET', endpoint)
    
    def get_user_items(self, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get items listed by the authenticated user
        
        Args:
            limit: Maximum number of results
            offset: Result offset for pagination
            
        Returns:
            List of items
        """
        endpoint = '/sell/inventory/v1/inventory_item'
        params = {
            'limit': limit,
            'offset': offset
        }
        
        return self._make_request('GET', endpoint, params=params)
    
    def create_listing(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new listing on eBay
        
        Args:
            item_data: Dictionary with item details
            
        Returns:
            Dict with created listing details
        """
        endpoint = '/sell/inventory/v1/inventory_item'
        return self._make_request('POST', endpoint, json=item_data)
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Any:
        """
        Make an authenticated request to the eBay API
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            **kwargs: Additional request parameters
            
        Returns:
            Response data as dict or list
        """
        url = f"{self.base_url}{endpoint}"
        
        # Get access token and set auth header
        token = self.get_access_token()
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Update headers with any provided in kwargs
        if 'headers' in kwargs:
            headers.update(kwargs.pop('headers'))
            
        try:
            response = requests.request(
                method, 
                url,
                headers=headers,
                **kwargs
            )
            
            response.raise_for_status()
            
            if response.content:
                return response.json()
            return {}
            
        except requests.exceptions.RequestException as e:
            logger.error(f"eBay API request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            raise

# Helper function to get eBay client instance
def get_ebay_client(sandbox: bool = False) -> EbayClient:
    """
    Get a configured eBay client instance
    
    Args:
        sandbox: Whether to use sandbox environment
        
    Returns:
        EbayClient instance
    """
    return EbayClient(sandbox=sandbox)