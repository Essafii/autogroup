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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  ShoppingCart,
  CheckCircle,
  Pending,
  LocalShipping,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { commandesService } from '../services/api';
import toast from 'react-hot-toast';

export const Commandes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [encaissementFilter, setEncaissementFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['commandes', { search: searchTerm, statut: statutFilter, is_encaisse: encaissementFilter }],
    () => commandesService.getAll({
      search: searchTerm,
      statut: statutFilter,
      is_encaisse: encaissementFilter,
    })
  );

  const validerMutation = useMutation(
    (id: string) => commandesService.valider(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('commandes');
        toast.success('Commande validée avec succès');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la validation');
      },
    }
  );

  const handleValider = (id: string) => {
    if (window.confirm('Valider cette commande ?')) {
      validerMutation.mutate(id);
    }
  };

  const commandes = data?.data?.commandes || [];

  // Statistiques rapides
  const totalCommandes = commandes.length;
  const commandesBrouillon = commandes.filter((c: any) => c.statut === 'brouillon').length;
  const commandesValidees = commandes.filter((c: any) => c.statut === 'validee').length;
  const commandesEncaisses = commandes.filter((c: any) => c.is_encaisse).length;

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'brouillon':
        return <Pending color="warning" />;
      case 'validee':
        return <CheckCircle color="info" />;
      case 'livree':
        return <LocalShipping color="success" />;
      case 'facturee':
        return <CheckCircle color="success" />;
      default:
        return <Pending />;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'brouillon':
        return 'warning';
      case 'validee':
        return 'info';
      case 'livree':
        return 'success';
      case 'facturee':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Commandes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Nouvelle Commande
        </Button>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalCommandes}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Commandes
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
                <Pending color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{commandesBrouillon}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Brouillons
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
                <CheckCircle color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{commandesValidees}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Validées
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
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{commandesEncaisses}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Encaissées
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="brouillon">Brouillon</MenuItem>
              <MenuItem value="validee">Validée</MenuItem>
              <MenuItem value="livree">Livrée</MenuItem>
              <MenuItem value="facturee">Facturée</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Encaissement</InputLabel>
            <Select
              value={encaissementFilter}
              onChange={(e) => setEncaissementFilter(e.target.value)}
              label="Encaissement"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="true">Encaissées</MenuItem>
              <MenuItem value="false">Non Encaissées</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Commercial</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Montant TTC</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Encaissement</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : commandes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            ) : (
              commandes.map((commande: any) => (
                <TableRow key={commande.id}>
                  <TableCell>{commande.numero}</TableCell>
                  <TableCell>
                    {commande.client?.type === 'particulier'
                      ? `${commande.client?.prenom} ${commande.client?.nom}`
                      : commande.client?.raison_sociale}
                  </TableCell>
                  <TableCell>
                    {commande.commercial?.prenom} {commande.commercial?.nom}
                  </TableCell>
                  <TableCell>
                    {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{commande.montant_ttc} MAD</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatutIcon(commande.statut)}
                      label={commande.statut}
                      color={getStatutColor(commande.statut) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={commande.is_encaisse ? 'Encaissé' : 'Non Encaissé'}
                      color={commande.is_encaisse ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCommande(commande);
                        setOpenDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    {commande.statut === 'brouillon' && (
                      <IconButton
                        size="small"
                        onClick={() => handleValider(commande.id)}
                        color="primary"
                      >
                        Valider
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {/* handleDelete */}}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog pour créer/éditer une commande */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedCommande ? 'Modifier la commande' : 'Nouvelle commande'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Formulaire de création/édition de commande à implémenter
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














