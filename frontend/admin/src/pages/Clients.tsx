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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Business,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { clientsService } from '../services/api';
import toast from 'react-hot-toast';

export const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [prospectFilter, setProspectFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['clients', { search: searchTerm, type: typeFilter, is_prospect: prospectFilter }],
    () => clientsService.getAll({
      search: searchTerm,
      type: typeFilter,
      is_prospect: prospectFilter,
    })
  );

  const deleteMutation = useMutation(
    (id: string) => clientsService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast.success('Client supprimé avec succès');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      },
    }
  );

  const convertMutation = useMutation(
    (id: string) => clientsService.convertToClient(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast.success('Prospect converti en client');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la conversion');
      },
    }
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleConvert = (id: string) => {
    if (window.confirm('Convertir ce prospect en client ?')) {
      convertMutation.mutate(id);
    }
  };

  const clients = data?.data?.clients || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Nouveau Client
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="particulier">Particulier</MenuItem>
              <MenuItem value="entreprise">Entreprise</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={prospectFilter}
              onChange={(e) => setProspectFilter(e.target.value)}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="true">Prospects</MenuItem>
              <MenuItem value="false">Clients</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Nom / Raison sociale</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.type === 'particulier' ? (
                      <Chip icon={<Person />} label="Particulier" size="small" />
                    ) : (
                      <Chip icon={<Business />} label="Entreprise" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {client.type === 'particulier'
                      ? `${client.prenom} ${client.nom}`
                      : client.raison_sociale}
                  </TableCell>
                  <TableCell>{client.telephone}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.ville || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={client.is_prospect ? 'Prospect' : 'Client'}
                      color={client.is_prospect ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedClient(client);
                        setOpenDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    {client.is_prospect && (
                      <IconButton
                        size="small"
                        onClick={() => handleConvert(client.id)}
                        color="primary"
                      >
                        Convertir
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(client.id)}
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

      {/* Dialog pour créer/éditer un client */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedClient ? 'Modifier le client' : 'Nouveau client'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Formulaire de création/édition de client à implémenter
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















