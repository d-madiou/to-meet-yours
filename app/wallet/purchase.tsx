import { Colors } from '@/constants/theme';
import { messagingService } from '@/src/services/api/messaging.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CoinPackage {
  id: string;
  amount: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

export default function CoinPurchaseScreen() {
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string;
  const minCoins = parseInt(params.minCoins as string) || 0;

  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Coin packages (customize based on your pricing)
  const packages: CoinPackage[] = [
    { id: 'starter', amount: 10, price: 0.99 },
    { id: 'basic', amount: 50, price: 3.99, bonus: 5 },
    { id: 'popular', amount: 100, price: 6.99, bonus: 15, popular: true },
    { id: 'premium', amount: 250, price: 14.99, bonus: 50 },
    { id: 'ultimate', amount: 500, price: 24.99, bonus: 100 },
  ];

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const wallet = await messagingService.getWalletBalance();
      setCurrentBalance(wallet.balance);
    } catch (error) {
      console.error('Load balance error:', error);
    }
  };

  const handlePurchase = async (pkg: CoinPackage) => {
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${pkg.amount}${pkg.bonus ? ` + ${pkg.bonus} bonus` : ''} coins for $${pkg.price.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => processPurchase(pkg),
        },
      ]
    );
  };

  const processPurchase = async (pkg: CoinPackage) => {
    setLoading(true);
    try {
      // In production, integrate with payment gateway (Stripe, PayPal, etc.)
      // For now, simulate purchase
      
      const totalCoins = pkg.amount + (pkg.bonus || 0);
      const paymentReference = `TEST_${Date.now()}`; // Replace with real payment ID
      
      await messagingService.purchaseCoins(totalCoins, paymentReference);
      
      // Reload balance
      await loadBalance();
      
      Alert.alert(
        'Purchase Successful! 🎉',
        `${totalCoins} coins have been added to your wallet!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (returnTo) {
                router.replace(returnTo);
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Purchase Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Get Coins</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Ionicons name="diamond" size={40} color="#FF9F0A" />
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{currentBalance} coins</Text>
        </View>

        {/* Minimum Required (if applicable) */}
        {minCoins > 0 && (
          <View style={styles.requirementCard}>
            <Ionicons name="information-circle" size={20} color={Colors.dark.primary} />
            <Text style={styles.requirementText}>
              You need at least {minCoins} coin{minCoins > 1 ? 's' : ''} to continue
            </Text>
          </View>
        )}

        {/* Packages */}
        <Text style={styles.sectionTitle}>Choose a Package</Text>
        
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              pkg.popular && styles.popularCard,
            ]}
            onPress={() => handlePurchase(pkg)}
            disabled={loading}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.packageHeader}>
              <View style={styles.packageInfo}>
                <Ionicons name="diamond" size={28} color="#FF9F0A" />
                <View style={styles.packageDetails}>
                  <Text style={styles.packageAmount}>
                    {pkg.amount} Coins
                  </Text>
                  {pkg.bonus && (
                    <Text style={styles.bonusText}>
                      + {pkg.bonus} bonus coins
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>${pkg.price.toFixed(2)}</Text>
                <Text style={styles.perCoin}>
                  ${(pkg.price / (pkg.amount + (pkg.bonus || 0))).toFixed(3)}/coin
                </Text>
              </View>
            </View>

            <View style={styles.packageFooter}>
              <Text style={styles.totalCoins}>
                Total: {pkg.amount + (pkg.bonus || 0)} coins
              </Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.dark.text} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.dark.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Secure Payment</Text>
            <Text style={styles.infoText}>
              All transactions are encrypted and secure. Coins never expire.
            </Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By purchasing, you agree to our Terms of Service and Privacy Policy.
          Coins are non-refundable.
        </Text>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Processing purchase...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.inputBorder,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.placeholder,
    marginTop: 12,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  requirementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  popularCard: {
    borderColor: Colors.dark.primary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packageDetails: {
    gap: 2,
  },
  packageAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  bonusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  perCoin: {
    fontSize: 11,
    color: Colors.dark.placeholder,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
  },
  totalCoins: {
    fontSize: 13,
    color: Colors.dark.placeholder,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark.placeholder,
    lineHeight: 16,
  },
  terms: {
    fontSize: 11,
    color: Colors.dark.placeholder,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});