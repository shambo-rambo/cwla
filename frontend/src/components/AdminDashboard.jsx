import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Grid,
  LinearProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import { Visibility, Close, ArrowBack } from '@mui/icons-material';

const AdminDashboard = ({ user, onBack }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    frameworkChats: 0,
    lessonChats: 0,
    uniqueUsers: 0
  });

  // Check if user is authorized admin
  const isAuthorizedAdmin = user?.email === 'simon.hamblin@gmail.com';

  useEffect(() => {
    if (isAuthorizedAdmin) {
      loadAdminData();
    }
  }, [isAuthorizedAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/conversations`, {
        headers: {
          'x-admin-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
        
        // Calculate stats
        const frameworkChats = data.conversations.filter(c => c.chat_type === 'framework').length;
        const lessonChats = data.conversations.filter(c => c.chat_type === 'lesson').length;
        const uniqueUsers = new Set(data.conversations.map(c => c.user_email)).size;
        const totalMessages = data.conversations.reduce((sum, c) => sum + parseInt(c.message_count), 0);
        
        setStats({
          totalConversations: data.conversations.length,
          totalMessages,
          frameworkChats,
          lessonChats,
          uniqueUsers
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewConversation = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setConversationMessages(data.messages);
        setSelectedConversation(conversations.find(c => c.id === conversationId));
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <Card sx={{ maxWidth: 400, p: 4, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
              Access Denied
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You are not authorized to access the admin dashboard.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Only simon.hamblin@gmail.com can access this area.
            </Typography>
            <Button onClick={onBack} variant="contained" sx={{ mt: 3 }}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton onClick={onBack} color="inherit" sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">Admin Dashboard</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading admin data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton onClick={onBack} color="inherit" sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Teaching Cycle AI Analytics
          </Typography>
          <Typography variant="body2">
            Welcome, {user.displayName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 2.4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {stats.totalConversations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Conversations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 2.4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main">
                  {stats.totalMessages}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Messages
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 2.4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.uniqueUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 2.4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {stats.frameworkChats}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Framework Chats
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 2.4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.lessonChats}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lesson Chats
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Conversations Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Conversations
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Messages</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conversations.map((conversation) => (
                    <TableRow key={conversation.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {conversation.user_name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.user_email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={conversation.chat_type}
                          color={conversation.chat_type === 'framework' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conversation.title || 'Untitled'}
                        </Typography>
                      </TableCell>
                      <TableCell>{conversation.message_count}</TableCell>
                      <TableCell>
                        {new Date(conversation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => viewConversation(conversation.id)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Conversation Details Modal */}
      <Dialog 
        open={!!selectedConversation} 
        onClose={() => setSelectedConversation(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                {selectedConversation?.title || 'Conversation Details'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedConversation?.user_name} ({selectedConversation?.user_email})
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedConversation(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {conversationMessages.map((message, index) => (
            <Card 
              key={index} 
              sx={{ 
                mb: 2, 
                bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  {message.role}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {new Date(message.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;