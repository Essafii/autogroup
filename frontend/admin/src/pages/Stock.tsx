import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Search,
  Warehouse,
  Warning,
  SwapHoriz,
  Inventory,
  LocalShipping,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { stockService } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-tabpanel-${index}`}
      aria-labelledby={`stock-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Stock: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'transfert' | 'inventaire' | 'bcg'>('transfert');

  const { data: seuilsData, isLoading: seuilsLoading } = useQuery(
    'stock-seuils',
    () => stockService.getSeuils()
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'transfert' | 'inventaire' | 'bcg') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const articlesSousSeuil = seuilsData?.data?.articlesSousSeuil || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion du Stock</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => handleOpenDialog('transfert')}
          >
            Transfert
          </Button>
          <Button
            variant="outlined"
            startIcon={<Inventory />}
            onClick={() => handleOpenDialog('inventaire')}
          >
            Inventaire
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocalShipping />}
            onClick={() => handleOpenDialog('bcg')}
          >
            BCG
          </Button>
        </Box>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warehouse color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">-</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Articles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{articlesSousSeuil.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sous Seuil
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SwapHoriz color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">-</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transferts en Cours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">-</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Véhicules Actifs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="stock tabs">
            <Tab label="Articles sous Seuil" />
            <Tab label="Mouvements de Stock" />
            <Tab label="Transferts" />
            <Tab label="BCG/BRT" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ width: 300 }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Article</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Stock Actuel</TableCell>
                  <TableCell>Seuil Min</TableCell>
                  <TableCell>Dépôt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seuilsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : articlesSousSeuil.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun article sous seuil
                    </TableCell>
                  </TableRow>
                ) : (
                  articlesSousSeuil.map((item: any) => (
                    <TableRow key={`${item.article.id}-${item.agence.id}`}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.article.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.article.marque}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.article.sku}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">{item.quantite}</Typography>
                          <Warning color="warning" sx={{ ml: 1, fontSize: 16 }} />
                        </Box>
                      </TableCell>
                      <TableCell>{item.article.seuil_min}</TableCell>
                      <TableCell>{item.agence.nom}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Commander
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary">
            Mouvements de stock à implémenter
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="text.secondary">
            Transferts en cours à implémenter
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body2" color="text.secondary">
            BCG/BRT à implémenter
          </Typography>
        </TabPanel>
      </Paper>

      {/* Dialog pour les actions de stock */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'transfert' && 'Nouveau Transfert'}
          {dialogType === 'inventaire' && 'Inventaire'}
          {dialogType === 'bcg' && 'Nouveau BCG'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Formulaire {dialogType} à implémenter
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};














