// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import RefugeAllyLogo from '../components/Common/RefugeAllyLogo';

const SignupPage = ({ onSignup, onPageChange }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onSignup({ email: formData.email, name: formData.firstName });
      setLoading(false);
    }, 1500);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <RefugeAllyLogo size={60} />
        <Typography variant="h4" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join RefugeAlly to access comprehensive health support
        </Typography>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeToTerms}
                        onChange={handleChange('agreeToTerms')}
                        required
                      />
                    }
                    label="I agree to the Terms of Service and Privacy Policy"
                  />
                </Grid>
              </Grid>
              
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !formData.agreeToTerms}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onPageChange('login')}
            >
              Already have an account? Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignupPage;