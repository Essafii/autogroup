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
  People,
  AccessTime,
  Event,
  AttachMoney,
  Receipt,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { rhepService } from '../services/api';

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
      id={`rhep-tabpanel-${index}`}
      aria-labelledby={`rhep-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const RHEP: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'employee' | 'attendance' | 'leave' | 'expense'>('employee');

  const { data: employeesData, isLoading: employeesLoading } = useQuery(
    'employees',
    () => rhepService.employees.getAll()
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    'attendance',
    () => rhepService.attendance.getAll()
  );

  const { data: leavesData, isLoading: leavesLoading } = useQuery(
    'leaves',
    () => rhepService.leaves.getAll()
  );

  const { data: expensesData, isLoading: expensesLoading } = useQuery(
    'expenses',
    () => rhepService.expenses.getAll()
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'employee' | 'attendance' | 'leave' | 'expense') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const employees = employeesData?.data?.employees || [];
  const attendances = attendanceData?.data?.attendances || [];
  const leaves = leavesData?.data?.leaves || [];
  const expenses = expensesData?.data?.expenses || [];

  // Statistiques rapides
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((emp: any) => emp.is_active).length;
  const pendingLeaves = leaves.filter((leave: any) => leave.statut === 'en_attente').length;
  const pendingExpenses = expenses.filter((expense: any) => expense.statut === 'en_attente').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">RH & Paie</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<People />}
            onClick={() => handleOpenDialog('employee')}
          >
            Employé
          </Button>
          <Button
            variant="outlined"
            startIcon={<AccessTime />}
            onClick={() => handleOpenDialog('attendance')}
          >
            Présence
          </Button>
          <Button
            variant="outlined"
            startIcon={<Event />}
            onClick={() => handleOpenDialog('leave')}
          >
            Congé
          </Button>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => handleOpenDialog('expense')}
          >
            Note de Frais
          </Button>
        </Box>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalEmployees}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employés
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
                <People color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{activeEmployees}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actifs
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
                <Event color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{pendingLeaves}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Congés en Attente
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
                <Receipt color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{pendingExpenses}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Frais en Attente
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="rhep tabs">
            <Tab label="Employés" />
            <Tab label="Présence" />
            <Tab label="Congés" />
            <Tab label="Notes de Frais" />
            <Tab label="Commissions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Rechercher un employé..."
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
                  <TableCell>Nom</TableCell>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Poste</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Salaire</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun employé trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee: any) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.user?.prenom} {employee.user?.nom}
                      </TableCell>
                      <TableCell>{employee.matricule}</TableCell>
                      <TableCell>{employee.poste}</TableCell>
                      <TableCell>{employee.departement}</TableCell>
                      <TableCell>{employee.salaire_brut} MAD</TableCell>
                      <TableCell>
                        <Chip
                          label={employee.is_active ? 'Actif' : 'Inactif'}
                          color={employee.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Add />
                        </IconButton>
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
            Gestion de la présence à implémenter
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="text.secondary">
            Gestion des congés à implémenter
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body2" color="text.secondary">
            Gestion des notes de frais à implémenter
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="body2" color="text.secondary">
            Gestion des commissions à implémenter
          </Typography>
        </TabPanel>
      </Paper>

      {/* Dialog pour les actions RHEP */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'employee' && 'Nouvel Employé'}
          {dialogType === 'attendance' && 'Enregistrer Présence'}
          {dialogType === 'leave' && 'Nouvelle Demande de Congé'}
          {dialogType === 'expense' && 'Nouvelle Note de Frais'}
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














