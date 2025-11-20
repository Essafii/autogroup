import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  ShoppingCart,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { clientsService, articlesService, commandesService } from '../services/api';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 1,
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color="primary">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { data: clientsData } = useQuery('clients', () => clientsService.getAll({ limit: 1 }));
  const { data: articlesData } = useQuery('articles', () => articlesService.getAll({ limit: 1 }));
  const { data: commandesData } = useQuery('commandes', () => commandesService.getAll({ limit: 1 }));

  const stats = [
    {
      title: 'Total Clients',
      value: clientsData?.data?.pagination?.total || 0,
      icon: <People />,
      color: '#1976d2',
    },
    {
      title: 'Total Articles',
      value: articlesData?.data?.pagination?.total || 0,
      icon: <Inventory />,
      color: '#388e3c',
    },
    {
      title: 'Commandes du Mois',
      value: commandesData?.data?.pagination?.total || 0,
      icon: <ShoppingCart />,
      color: '#f57c00',
    },
    {
      title: 'Chiffre d\'Affaires',
      value: '0 MAD',
      icon: <TrendingUp />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des Ventes
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              Graphique des ventes à implémenter
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top Articles
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              Top articles à implémenter
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};















