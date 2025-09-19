import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  TrendingUp,
  Favorite,
  Security,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const Overview = () => {
  const healthMetrics = [
    { title: 'Health Score', value: 85, color: 'success', icon: <Favorite /> },
    { title: 'Risk Level', value: 'Low', color: 'success', icon: <Security /> },
    { title: 'Consultations', value: 12, color: 'primary', icon: <TrendingUp /> }
  ];

  const recentActivity = [
    { text: 'Completed health assessment', type: 'success', time: '2 hours ago' },
    { text: 'Medication reminder', type: 'info', time: '1 day ago' },
    { text: 'Follow-up scheduled', type: 'warning', time: '3 days ago' }
  ];

  const chartData = [
    { name: 'Mon', health: 82 },
    { name: 'Tue', health: 85 },
    { name: 'Wed', health: 78 },
    { name: 'Thu', health: 88 },
    { name: 'Fri', health: 85 },
    { name: 'Sat', health: 90 },
    { name: 'Sun', health: 87 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom className="gradient-text">
        Health Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Metrics Cards */}
        {healthMetrics.map((metric, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card className="glass-card floating-element">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '12px',
                      background: `${metric.color}.light`,
                      color: 'white'
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {metric.value}{typeof metric.value === 'number' ? '%' : ''}
                    </Typography>
                  </Box>
                </Box>
                {typeof metric.value === 'number' && (
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.value} 
                    sx={{ mt: 2, height: 6, borderRadius: 3 }}
                    color={metric.color}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Health Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card className="glass-card">
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Health Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    stroke="url(#gradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card className="glass-card">
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Recent Activity
              </Typography>
              <List disablePadding>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {activity.type === 'success' && <CheckCircle color="success" />}
                      {activity.type === 'warning' && <Warning color="warning" />}
                      {activity.type === 'info' && <Info color="info" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={activity.text}
                      secondary={activity.time}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
