import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '../providers/ToastProvider';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const toast = useToast();
  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.contact || !formData.password || !formData.confirmPassword) {
      toast.show('Please fill in all fields');
      return;
    }
    // Validate Indian mobile number format
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(formData.contact)) {
      toast.show('Please enter a valid mobile number');
      return;
    }

    if (!formData.email.includes('@')) {
    toast.show('Please enter a valid email address');
      return;
    }
    console.log(formData);
    
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.contact, formData.password);
      
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Markaz community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoComplete="name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contact Number <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.contact}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contact: text })
                  }
                  placeholder="Enter your contact number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoComplete="tel"
                  maxLength={10}
                  inputMode="numeric"
                />
              </View>
              {formData.contact &&
                formData.contact.length > 0 &&
                formData.contact.length < 10 && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'red',
                      marginLeft: 8,
                      marginTop: 4,
                    }}
                  >
                    Please enter valid contact number.
                  </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={styles.label}>
                  Password <Text style={{ color: 'red' }}>*</Text>
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {formData.password.length < 8 && (
                <Text
                  style={{
                    fontSize: 12,
                    color: 'red',
                    marginLeft: 8,
                    marginTop: 4,
                  }}
                >
                  Please enter at least 8 characters
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {formData.password !== formData.confirmPassword && (
                <Text
                  style={{
                    fontSize: 12,
                    color: 'red',
                    marginLeft: 8,
                    marginTop: 4,
                  }}
                >
                  Passwords do not match
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});