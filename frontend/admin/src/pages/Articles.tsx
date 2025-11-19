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
  Inventory,
  Warning,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { articlesService } from '../services/api';
import toast from 'react-hot-toast';

export const Articles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [familleFilter, setFamilleFilter] = useState('');
  const [marqueFilter, setMarqueFilter] = useState('');
  const [sousSeuilFilter, setSousSeuilFilter] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['articles', { search: searchTerm, famille: familleFilter, marque: marqueFilter, sous_seuil: sousSeuilFilter }],
    () => articlesService.getAll({
      search: searchTerm,
      famille: familleFilter,
      marque: marqueFilter,
      sous_seuil: sousSeuilFilter,
    })
  );

  const { data: famillesData } = useQuery('familles', () => articlesService.getFamilles());

  const deleteMutation = useMutation(
    (id: string) => articlesService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('articles');
        toast.success('Article supprimé avec succès');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      },
    }
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deleteMutation.mutate(id);
    }
  };

  const articles = data?.data?.articles || [];
  const familles = famillesData?.data?.familles || [];

  // Statistiques rapides
  const totalArticles = articles.length;
  const articlesSousSeuil = articles.filter((article: any) => 
    article.stocks?.some((stock: any) => stock.quantite <= article.seuil_min)
  ).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Articles</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Nouvel Article
        </Button>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalArticles}</Typography>
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
                  <Typography variant="h6">{articlesSousSeuil}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sous Seuil
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
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Famille</InputLabel>
            <Select
              value={familleFilter}
              onChange={(e) => setFamilleFilter(e.target.value)}
              label="Famille"
            >
              <MenuItem value="">Toutes</MenuItem>
              {familles.map((famille: string) => (
                <MenuItem key={famille} value={famille}>
                  {famille}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Marque</InputLabel>
            <Select
              value={marqueFilter}
              onChange={(e) => setMarqueFilter(e.target.value)}
              label="Marque"
            >
              <MenuItem value="">Toutes</MenuItem>
              {/* Les marques seraient récupérées via une API similaire */}
            </Select>
          </FormControl>
          <Button
            variant={sousSeuilFilter ? 'contained' : 'outlined'}
            onClick={() => setSousSeuilFilter(!sousSeuilFilter)}
            startIcon={<Warning />}
          >
            Sous Seuil
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Libellé</TableCell>
              <TableCell>Marque</TableCell>
              <TableCell>Famille</TableCell>
              <TableCell>Prix Public</TableCell>
              <TableCell>Stock Total</TableCell>
              <TableCell>Seuil Min</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article: any) => {
                const stockTotal = article.stocks?.reduce((sum: number, stock: any) => sum + stock.quantite, 0) || 0;
                const isSousSeuil = stockTotal <= article.seuil_min;
                
                return (
                  <TableRow key={article.id}>
                    <TableCell>{article.sku}</TableCell>
                    <TableCell>{article.libelle}</TableCell>
                    <TableCell>{article.marque}</TableCell>
                    <TableCell>
                      <Chip label={article.famille} size="small" />
                    </TableCell>
                    <TableCell>{article.prix_public} MAD</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">{stockTotal}</Typography>
                        {isSousSeuil && (
                          <Warning color="warning" sx={{ ml: 1, fontSize: 16 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{article.seuil_min}</TableCell>
                    <TableCell>
                      <Chip
                        label={article.is_active ? 'Actif' : 'Inactif'}
                        color={article.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedArticle(article);
                          setOpenDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(article.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog pour créer/éditer un article */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedArticle ? 'Modifier l\'article' : 'Nouvel article'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Formulaire de création/édition d'article à implémenter
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














