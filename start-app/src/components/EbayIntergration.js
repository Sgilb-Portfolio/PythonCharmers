import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'; // Assuming you're using Material UI

const EbayIntegration = () => {
  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState({
    client_id: '',
    client_secret: '',
    refresh_token: '',
    sandbox: true
  });
  const [hasCredentials, setHasCredentials] = useState(false);
  const [showCredentialDialog, setShowCredentialDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetailDialog, setItemDetailDialog] = useState(false);
  const [updateOrderDialog, setUpdateOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Fetch credentials on component mount
  useEffect(() => {
    fetchCredentials();
    // If credentials exist, fetch listings and orders
    if (hasCredentials) {
      fetchMyListings();
      fetchMyOrders();
    }
  }, [hasCredentials]);

  // Function to fetch eBay credentials
  const fetchCredentials = async () => {
    try {
      const response = await axios.get('/api/ebay/credentials/');
      if (response.data && response.data.length > 0) {
        // We have credentials
        setHasCredentials(true);
        setCredentials({
          client_id: response.data[0].client_id,
          sandbox: response.data[0].sandbox
        });
      } else {
        setHasCredentials(false);
      }
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setHasCredentials(false);
    }
  };

  // Save credentials
  const saveCredentials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (hasCredentials) {
        // Update existing credentials
        const response = await axios.get('/api/ebay/credentials/');
        if (response.data && response.data.length > 0) {
          await axios.put(`/api/ebay/credentials/${response.data[0].id}/`, credentials);
        }
      } else {
        // Create new credentials
        await axios.post('/api/ebay/credentials/', credentials);
        setHasCredentials(true);
      }
      setShowCredentialDialog(false);
      // Verify the credentials
      await verifyCredentials();
    } catch (err) {
      console.error('Error saving credentials:', err);
      setError('Failed to save credentials: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Verify eBay credentials
  const verifyCredentials = async () => {
    try {
      const response = await axios.get('/api/ebay/credentials/');
      if (response.data && response.data.length > 0) {
        await axios.post(`/api/ebay/credentials/${response.data[0].id}/verify/`);
        // If we get here, verification was successful
        fetchMyListings();
        fetchMyOrders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error verifying credentials:', err);
      setError('Failed to verify credentials: ' + (err.response?.data?.error || err.message));
      return false;
    }
  };

  // Handle search for eBay items
  const handleSearch = async () => {
    if (!searchKeywords.trim()) {
      setError('Please enter search keywords');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/ebay/items/search/', {
        params: { keywords: searchKeywords }
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's eBay listings
  const fetchMyListings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/ebay/items/user_items/');
      setMyListings(response.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      if (err.response?.status === 400 && err.response?.data?.error?.includes('credentials')) {
        setHasCredentials(false);
      } else {
        setError('Failed to fetch your listings: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's eBay orders
  const fetchMyOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/ebay/orders/');
      setMyOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch your orders: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Get detailed item information
  const getItemDetails = async (item) => {
    setSelectedItem(item);
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/ebay/items/${item.id}/detail/`);
      setSelectedItem({ ...item, ...response.data });
      setItemDetailDialog(true);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to get item details: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Open order update dialog
  const openUpdateOrderDialog = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setUpdateOrderDialog(true);
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    setIsLoading(true);
    try {
      await axios.post(`/api/ebay/orders/${selectedOrder.id}/update_status/`, {
        status: newOrderStatus
      });
      
      if (trackingNumber && trackingNumber !== selectedOrder.tracking_number) {
        await axios.post(`/api/ebay/orders/${selectedOrder.id}/update_tracking/`, {
          tracking_number: trackingNumber
        });
      }
      
      // Refresh orders
      fetchMyOrders();
      setUpdateOrderDialog(false);
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 4 }}>
          No results found. Try a different search term.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {searchResults.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.item_id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={item.image_url || '/static/placeholder.png'}
                alt={item.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {item.title}
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {item.price} {item.currency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Condition: {item.condition || 'N/A'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" href={item.url} target="_blank">
                  View on eBay
                </Button>
                <Button size="small" color="secondary" onClick={() => getItemDetails(item)}>
                  Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render user's listings
  const renderMyListings = () => {
    if (!hasCredentials) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="textSecondary" paragraph>
            You need to set up your eBay credentials first.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowCredentialDialog(true)}
          >
            Set Up eBay Credentials
          </Button>
        </Box>
      );
    }

    if (myListings.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 4 }}>
          You don't have any active listings on eBay.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {myListings.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.inventoryItemId || item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {item.title || item.product?.title || 'Untitled Item'}
                </Typography>
                {item.price && (
                  <Typography variant="body1" color="text.primary">
                    {item.price?.value || item.price} {item.price?.currency || 'USD'}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Quantity: {item.quantity || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {item.status || item.ebay_listing_status || 'N/A'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="secondary" onClick={() => getItemDetails(item)}>
                  Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render user's orders
  const renderMyOrders = () => {
    if (!hasCredentials) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="textSecondary" paragraph>
            You need to set up your eBay credentials first.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowCredentialDialog(true)}
          >
            Set Up eBay Credentials
          </Button>
        </Box>
      );
    }

    if (myOrders.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 4 }}>
          You don't have any orders.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {myOrders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6" component="h2">
                  Order #{order.order_id}
                </Typography>
                <Typography variant="body1" color="text.primary">
                  Buyer: {order.buyer_username}
                </Typography>
                <Typography variant="body1" color="text.primary">
                  Total: {order.total_amount} {order.currency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {order.status}
                </Typography>
                {order.tracking_number && (
                  <Typography variant="body2" color="text.secondary">
                    Tracking #: {order.tracking_number}
                  </Typography>
                )}
                
                {order.items && order.items.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Items:</Typography>
                    {order.items.map((item) => (
                      <Box key={item.id} sx={{ ml: 2, mt: 1 }}>
                        <Typography variant="body2">
                          {item.quantity}x {item.title} - {item.price} {order.currency}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => openUpdateOrderDialog(order)}>
                  Update Order
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        eBay Integration
      </Typography>
      
      {/* Credentials button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => setShowCredentialDialog(true)}
        >
          {hasCredentials ? 'Update Credentials' : 'Set Up eBay Credentials'}
        </Button>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="eBay integration tabs">
          <Tab label="Search eBay" />
          <Tab label="My eBay Listings" />
          <Tab label="My Orders" />
        </Tabs>
      </Box>
      
      {/* Tab Panels */}
      {/* Search Tab */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Search for items on eBay"
                variant="outlined"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderSearchResults()
            )}
          </Box>
        </Box>
      )}
      
      {/* My Listings Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchMyListings}
              disabled={isLoading || !hasCredentials}
            >
              Refresh Listings
            </Button>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderMyListings()
          )}
        </Box>
      )}
      
      {/* My Orders Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchMyOrders}
              disabled={isLoading || !hasCredentials}
            >
              Refresh Orders
            </Button>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderMyOrders()
          )}
        </Box>
      )}
      
      {/* Credentials Dialog */}
      <Dialog open={showCredentialDialog} onClose={() => setShowCredentialDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>eBay API Credentials</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client ID"
            type="text"
            fullWidth
            variant="outlined"
            value={credentials.client_id}
            onChange={(e) => setCredentials({ ...credentials, client_id: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Client Secret"
            type="password"
            fullWidth
            variant="outlined"
            value={credentials.client_secret}
            onChange={(e) => setCredentials({ ...credentials, client_secret: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Refresh Token"
            type="password"
            fullWidth
            variant="outlined"
            value={credentials.refresh_token}
            onChange={(e) => setCredentials({ ...credentials, refresh_token: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Environment</InputLabel>
            <Select
              value={credentials.sandbox}
              label="Environment"
              onChange={(e) => setCredentials({ ...credentials, sandbox: e.target.value })}
            >
              <MenuItem value={true}>Sandbox</MenuItem>
              <MenuItem value={false}>Production</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            You need to register an application on the eBay Developer Portal to get your credentials.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCredentialDialog(false)}>Cancel</Button>
          <Button onClick={saveCredentials} color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Item Detail Dialog */}
      <Dialog open={itemDetailDialog} onClose={() => setItemDetailDialog(false)} maxWidth="md" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>{selectedItem.title}</DialogTitle>
            <DialogContent>
              {selectedItem.image_url && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.title} 
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom>
                Price: {selectedItem.price} {selectedItem.currency}
              </Typography>
              
              {selectedItem.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Description:</Typography>
                  <Typography variant="body2">{selectedItem.description}</Typography>
                </Box>
              )}
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Condition:</strong> {selectedItem.condition || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Quantity:</strong> {selectedItem.quantity || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Item ID:</strong> {selectedItem.item_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedItem.ebay_listing_status || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setItemDetailDialog(false)}>Close</Button>
              {selectedItem.url && (
                <Button color="primary" href={selectedItem.url} target="_blank">
                  View on eBay
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Update Order Dialog */}
      <Dialog open={updateOrderDialog} onClose={() => setUpdateOrderDialog(false)}>
        {selectedOrder && (
          <>
            <DialogTitle>Update Order #{selectedOrder.order_id}</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={newOrderStatus}
                  label="Order Status"
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                  <MenuItem value="SHIPPED">Shipped</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="REFUNDED">Refunded</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                margin="dense"
                label="Tracking Number"
                type="text"
                fullWidth
                variant="outlined"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUpdateOrderDialog(false)}>Cancel</Button>
              <Button onClick={updateOrderStatus} color="primary" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Update'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EbayIntegration;