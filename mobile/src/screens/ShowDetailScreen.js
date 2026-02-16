import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Linking, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../services/theme';

export default function ShowDetailScreen({ route, navigation }) {
  const { show } = route.params;

  const startDate = new Date(show.run_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const endDate = new Date(show.run_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  async function handleBooking() {
    if (!show.booking_url) {
      Alert.alert('No booking link', 'Visit the venue website directly to book tickets');
      return;
    }
    const supported = await Linking.canOpenURL(show.booking_url);
    if (supported) {
      await Linking.openURL(show.booking_url);
    } else {
      Alert.alert('Cannot open link', show.booking_url);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Poster */}
        {show.poster_image_url ? (
          <Image source={{ uri: show.poster_image_url }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterEmoji}>🎭</Text>
          </View>
        )}

        {/* Back button overlay */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>

          {/* Title & genres */}
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{show.title}</Text>
              {show.company_name && (
                <Text style={styles.company}>{show.company_name}</Text>
              )}
            </View>
          </View>

          {/* Genres */}
          {show.genres?.length > 0 && (
            <View style={styles.genres}>
              {show.genres.map(g => (
                <View key={g} style={styles.genreTag}>
                  <Text style={styles.genreText}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Key info */}
          <View style={styles.infoCard}>
            <InfoRow label="Venue" value={show.venue_name} />
            <InfoRow label="Location" value={`${show.city}, ${show.region?.replace(/_/g, ' ')}`} capitalize />
            <InfoRow label="Dates" value={`${startDate} – ${endDate}`} />
            {show.duration_minutes && (
              <InfoRow label="Duration" value={`${show.duration_minutes} minutes`} />
            )}
            {show.age_minimum && (
              <InfoRow label="Age" value={`${show.age_minimum}+`} />
            )}
          </View>

          {/* Price */}
          <View style={styles.priceCard}>
            {show.is_free ? (
              <Text style={styles.freeText}>FREE ENTRY</Text>
            ) : show.price_from ? (
              <View>
                <Text style={styles.priceFrom}>from £{show.price_from}</Text>
                {show.price_to && show.price_to !== show.price_from && (
                  <Text style={styles.priceTo}>up to £{show.price_to}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.priceTbc}>Price on application</Text>
            )}
          </View>

          {/* Accessibility */}
          {(show.has_bsl_shows || show.has_audio_described || show.has_captioned_shows || show.has_relaxed_shows) && (
            <View style={styles.accessCard}>
              <Text style={styles.accessTitle}>ACCESSIBILITY</Text>
              <View style={styles.accessTags}>
                {show.has_bsl_shows && <AccessTag label="BSL" />}
                {show.has_audio_described && <AccessTag label="Audio Described" />}
                {show.has_captioned_shows && <AccessTag label="Captioned" />}
                {show.has_relaxed_shows && <AccessTag label="Relaxed" />}
              </View>
            </View>
          )}

          {/* Description */}
          {show.short_description && (
            <View style={styles.descCard}>
              <Text style={styles.descTitle}>ABOUT</Text>
              <Text style={styles.description}>{show.short_description}</Text>
            </View>
          )}

          {/* Book button */}
          <TouchableOpacity style={styles.bookBtn} onPress={handleBooking}>
            <Text style={styles.bookBtnText}>Book Tickets</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, capitalize }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, capitalize && styles.capitalize]}>{value}</Text>
    </View>
  );
}

function AccessTag({ label }) {
  return (
    <View style={styles.accessTag}>
      <Text style={styles.accessTagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  poster: { width: '100%', height: 280 },
  posterPlaceholder: { width: '100%', height: 280, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  posterEmoji: { fontSize: 64 },
  backBtn: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20 },
  content: { padding: theme.spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  titleBlock: { flex: 1 },
  title: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text },
  company: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 4 },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md },
  genreTag: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: theme.borderRadius.full },
  genreText: { color: '#fff', fontSize: theme.fontSize.sm, fontWeight: '600' },
  infoCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  infoLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, flex: 1 },
  infoValue: { fontSize: theme.fontSize.sm, color: theme.colors.text, flex: 2, textAlign: 'right' },
  capitalize: { textTransform: 'capitalize' },
  priceCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  freeText: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.success },
  priceFrom: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text },
  priceTo: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  priceTbc: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  accessCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  accessTitle: { fontSize: theme.fontSize.xs, fontWeight: '700', color: theme.colors.primary, letterSpacing: 1.5, marginBottom: theme.spacing.sm },
  accessTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accessTag: { backgroundColor: theme.colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 5, borderRadius: theme.borderRadius.full },
  accessTagText: { fontSize: theme.fontSize.sm, color: theme.colors.text },
  descCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  descTitle: { fontSize: theme.fontSize.xs, fontWeight: '700', color: theme.colors.primary, letterSpacing: 1.5, marginBottom: theme.spacing.sm },
  description: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, lineHeight: 22 },
  bookBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.sm },
  bookBtnText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: '700' },
});
