import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';
import { CustomerProfileRequest, upsertProfile } from '../api/customer';
import { BeneficiaryRequest, BeneficiaryResponse, createBeneficiary, listBeneficiaries } from '../api/beneficiaries';
import { FxQuoteRequest, FxQuoteResponse, getQuote } from '../api/fx';
import { CreateTransferRequest, TransferResponse, createTransfer } from '../api/transfers';

const steps = ['Your details', 'Beneficiary', 'Amount & FX', 'Review & send'];

function SendMoneyPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Profile state
  const [profile, setProfile] = useState<CustomerProfileRequest>({
    firstName: '',
    lastName: '',
    countryOfResidence: 'US',
    addressLine1: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Beneficiary state
  const [beneficiaryForm, setBeneficiaryForm] = useState<BeneficiaryRequest>({
    fullName: '',
    country: 'IN',
    bankName: '',
    accountNumber: '',
    routingCode: '',
    payoutMethod: 'LOCAL',
    destinationCurrency: 'INR'
  });
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResponse[]>([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<number | null>(null);
  const [beneficiaryLoading, setBeneficiaryLoading] = useState(false);

  // FX state
  const [fxRequest, setFxRequest] = useState<FxQuoteRequest>({
    sourceCountry: 'US',
    targetCountry: 'IN',
    sourceCurrency: 'USD',
    targetCurrency: 'INR',
    sourceAmount: 100
  });
  const [fxQuote, setFxQuote] = useState<FxQuoteResponse | null>(null);
  const [fxLoading, setFxLoading] = useState(false);

  // Transfer state
  const [transfer, setTransfer] = useState<TransferResponse | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load beneficiaries list for selection
    (async () => {
      try {
        const list = await listBeneficiaries();
        setBeneficiaries(list);
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfileLoading(true);
    try {
      await upsertProfile({
        ...profile,
        dateOfBirth: undefined // keep simple for now
      });
      setActiveStep(1);
    } catch (err) {
      setError('Unable to save your details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBeneficiarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBeneficiaryLoading(true);
    try {
      const created = await createBeneficiary(beneficiaryForm);
      setSelectedBeneficiaryId(created.id);
      const list = await listBeneficiaries();
      setBeneficiaries(list);
      setActiveStep(2);
    } catch {
      setError('Unable to save beneficiary.');
    } finally {
      setBeneficiaryLoading(false);
    }
  };

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFxLoading(true);
    try {
      const quote = await getQuote(fxRequest);
      setFxQuote(quote);
      setActiveStep(3);
    } catch {
      setError('Unable to fetch FX quote.');
    } finally {
      setFxLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!fxQuote || !selectedBeneficiaryId) return;
    setError(null);
    setTransferLoading(true);
    try {
      const clientReference = (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `kubex-${Date.now()}`;

      const body: CreateTransferRequest = {
        beneficiaryId: selectedBeneficiaryId,
        sourceCountry: fxQuote.sourceCountry,
        targetCountry: fxQuote.targetCountry,
        sourceCurrency: fxQuote.sourceCurrency,
        targetCurrency: fxQuote.targetCurrency,
        sourceAmount: fxQuote.sourceAmount,
        targetAmount: fxQuote.targetAmount,
        auditId: fxQuote.auditId,
        clientReference
      };
      const res = await createTransfer(body);
      setTransfer(res);
    } catch {
      setError('Unable to create transfer.');
    } finally {
      setTransferLoading(false);
    }
  };

  const currentStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Your details</Typography>
            <TextField
              label="First name"
              value={profile.firstName}
              onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={profile.lastName}
              onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Country of residence (ISO code)"
              value={profile.countryOfResidence}
              onChange={e => setProfile(p => ({ ...p, countryOfResidence: e.target.value.toUpperCase() }))}
              required
              fullWidth
              placeholder="US"
            />
            <TextField
              label="Address line 1"
              value={profile.addressLine1}
              onChange={e => setProfile(p => ({ ...p, addressLine1: e.target.value }))}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth disabled={profileLoading}>
              {profileLoading ? <CircularProgress size={20} /> : 'Save & continue'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleBeneficiarySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Beneficiary</Typography>
            <TextField
              label="Full name"
              value={beneficiaryForm.fullName}
              onChange={e => setBeneficiaryForm(f => ({ ...f, fullName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Country (ISO)"
              value={beneficiaryForm.country}
              onChange={e => setBeneficiaryForm(f => ({ ...f, country: e.target.value.toUpperCase() }))}
              required
              fullWidth
              placeholder="IN"
            />
            <TextField
              label="Bank name"
              value={beneficiaryForm.bankName}
              onChange={e => setBeneficiaryForm(f => ({ ...f, bankName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Account number"
              value={beneficiaryForm.accountNumber}
              onChange={e => setBeneficiaryForm(f => ({ ...f, accountNumber: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Routing code"
              value={beneficiaryForm.routingCode}
              onChange={e => setBeneficiaryForm(f => ({ ...f, routingCode: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Payout method"
              value={beneficiaryForm.payoutMethod}
              onChange={e => setBeneficiaryForm(f => ({ ...f, payoutMethod: e.target.value }))}
              fullWidth
            >
              <MenuItem value="LOCAL">Local bank transfer</MenuItem>
              <MenuItem value="SWIFT">SWIFT</MenuItem>
            </TextField>
            <TextField
              label="Destination currency (ISO)"
              value={beneficiaryForm.destinationCurrency}
              onChange={e => setBeneficiaryForm(f => ({ ...f, destinationCurrency: e.target.value.toUpperCase() }))}
              required
              fullWidth
              placeholder="INR"
            />
            <Button type="submit" variant="contained" fullWidth disabled={beneficiaryLoading}>
              {beneficiaryLoading ? <CircularProgress size={20} /> : 'Save & continue'}
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handleGetQuote} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Amount & FX</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="From country"
                value={fxRequest.sourceCountry}
                onChange={e => setFxRequest(r => ({ ...r, sourceCountry: e.target.value.toUpperCase() }))}
                required
                fullWidth
              />
              <TextField
                label="To country"
                value={fxRequest.targetCountry}
                onChange={e => setFxRequest(r => ({ ...r, targetCountry: e.target.value.toUpperCase() }))}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="From currency"
                value={fxRequest.sourceCurrency}
                onChange={e => setFxRequest(r => ({ ...r, sourceCurrency: e.target.value.toUpperCase() }))}
                required
                fullWidth
              />
              <TextField
                label="To currency"
                value={fxRequest.targetCurrency}
                onChange={e => setFxRequest(r => ({ ...r, targetCurrency: e.target.value.toUpperCase() }))}
                required
                fullWidth
              />
            </Box>
            <TextField
              label="Amount to send"
              type="number"
              value={fxRequest.sourceAmount}
              onChange={e => setFxRequest(r => ({ ...r, sourceAmount: Number(e.target.value) }))}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth disabled={fxLoading}>
              {fxLoading ? <CircularProgress size={20} /> : 'Get quote'}
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Review & send</Typography>
            {fxQuote && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body1">
                  Sending <strong>{fxQuote.sourceAmount}</strong> {fxQuote.sourceCurrency} from {fxQuote.sourceCountry}.
                </Typography>
                <Typography variant="body1">
                  Recipient gets approximately <strong>{fxQuote.targetAmount}</strong> {fxQuote.targetCurrency} in {fxQuote.targetCountry}.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rate: 1 {fxQuote.sourceCurrency} = {fxQuote.rate} {fxQuote.targetCurrency}
                </Typography>
              </Paper>
            )}
            <Button
              variant="contained"
              fullWidth
              disabled={transferLoading || !fxQuote || !selectedBeneficiaryId}
              onClick={handleCreateTransfer}
            >
              {transferLoading ? <CircularProgress size={20} /> : 'Send money'}
            </Button>
            {transfer && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1">Transfer created</Typography>
                <Typography variant="body2">Status: {transfer.status}</Typography>
                <Typography variant="body2">Reference: {transfer.niumReference ?? 'pending'}</Typography>
                <Typography variant="body2">
                  Created at: {dayjs(transfer.createdAt).format('YYYY-MM-DD HH:mm')}
                </Typography>
              </Paper>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h1" textAlign="center">
        Send money with Kubex
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {error && <Alert severity="error">{error}</Alert>}
      {currentStepContent()}
    </Box>
  );
}

export default SendMoneyPage;
