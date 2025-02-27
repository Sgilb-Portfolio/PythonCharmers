# backend/api/etsy_client.py
import requests
from django.conf import settings

class EtsyClient:
    BASE_URL = "https://openapi.etsy.com/v3"
    
    def __init__(self):
        self.api_key = settings.ETSY_API_KEY
        self.headers = {
            "x-api-key": self.api_key,
            "Accept": "application/json"
        }
    
    def get_listings(self, shop_id=None, limit=25, offset=0):
        endpoint = f"{self.BASE_URL}/application/listings/active"
        params = {
            "limit": limit,
            "offset": offset,
            "shop_id": shop_id
        }
        response = requests.get(endpoint, headers=self.headers, params=params)
        return response.json()

# backend/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .etsy_client import EtsyClient

class EtsyListingsView(APIView):
    def get(self, request):
        try:
            client = EtsyClient()
            shop_id = request.query_params.get('shop_id')
            limit = request.query_params.get('limit', 25)
            offset = request.query_params.get('offset', 0)
            
            listings = client.get_listings(shop_id, limit, offset)
            return Response(listings)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# backend/api/urls.py
from django.urls import path
from .views import EtsyListingsView

urlpatterns = [
    path('etsy/listings/', EtsyListingsView.as_view(), name='etsy-listings'),
]

# backend/settings.py (add these settings)
ETSY_API_KEY = 'your_api_key_here'

# start-app/src/api/etsyService.js
const API_BASE_URL = '/api';

export const EtsyService = {
    getListings: async (shopId = null, limit = 25, offset = 0) => {
        try {
            const params = new URLSearchParams({
                shop_id: shopId,
                limit,
                offset
            });
            
            const response = await fetch(
                `${API_BASE_URL}/etsy/listings/?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching Etsy listings:', error);
            throw error;
        }
    }
};

# start-app/src/components/EtsyListings.jsx
import React, { useState, useEffect } from 'react';
import { EtsyService } from '../api/etsyService';

const EtsyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchListings();
    }, []);
    
    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await EtsyService.getListings();
            setListings(data.results || []);
        } catch (err) {
            setError('Failed to fetch Etsy listings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
                <div key={listing.listing_id} className="border rounded p-4">
                    <img 
                        src={listing.images?.[0]?.url_570xN} 
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                    />
                    <h3 className="text-lg font-semibold mt-2">{listing.title}</h3>
                    <p className="text-gray-600">${listing.price.amount / listing.price.divisor}</p>
                </div>
            ))}
        </div>
    );
};

export default EtsyListings;

# requirements.txt (add these)
requests==2.31.0
django-cors-headers==4.3.1