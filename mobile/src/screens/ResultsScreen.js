import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../services/theme';

const SORT_OPTIONS = ['Date', 'Price', 'Distance'];

function ShowCard({ item, onPress }) {
  const startDate = new Date(item.run_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDate = new Date(item.run_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      {item.poster_image_url ? (
        <Image source={{ uri: item.poster_image_url }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Text style={styles.posterEmoji}>🎭</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardVenue} numberOfLines={1}>{item.venue_name}</Text>
        <Text style={styles.cardCity}>{item.city} · {item.region?.replace('_', ' ')}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>{startDate} – {endDate}</Text>
        </View>
        <View style={styles.cardBottom}>
          {item.is_free ? (
            <Text style={styles.free}>FREE</Text>
          ) : item.price_from ? (
            <Text style={styles.price}>from £{item.price_from}</Text>
          ) : (
            <Text style={styles.priceTbc}>Price TBC</Text>
          )}
          {item.genres?.length > 0 && (
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{item.genres[0]}</Text>
            </View>
          )}
        </View>
        {item.distance_km && (
          <Text style={styles.distance}>{item.distance_km.toFixed(1)} km away</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ResultsScreen({ route, navigation }) {
  const { results = [], query } = route.params;
  const [sortBy, setSortBy] = useState('Date');

  const sorted = [...results].sort((a, b) => {
    if (sortBy === 'Date') return new Date(a.run_start) - new Date(b.run_start);
    if (sortBy === 'Price') return (a.price_from || 999) - (b.price_from || 999);
    if (sortBy === 'Distance') return (a.distance_km || 999) - (b.distance_km || 999);
    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.resultCount}>{results.length} shows found</Text>
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortBtn, sortBy === opt && styles.sortBtnActive]}
            onPress={() => setSortBy(opt)}
          >
            <Text style={[styles.sortText, sortBy === opt && styles.sortTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results list */}
      <FlatList
        data={sorted}
        keyExtractor={item => item.performance_id}
        renderItem={({ item }) => (
          <ShowCard
            item={item}
            onPress={(show) => navigation.navigate('ShowDetail', { show })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎭</Text>
            <Text style={styles.emptyText}>No shows found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md },
  backBtn: { padding: 4 },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.md },
  resultCount: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: 8 },
  sortLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginRight: 4 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  sortBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  sortText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  sortTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: theme.spacing.md, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.border },
  poster: { width: 90, height: 120 },
  posterPlaceholder: { width: 90, height: 120, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  posterEmoji: { fontSize: 32 },
  cardContent: { flex: 1, padding: theme.spacing.sm },
  cardTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginBottom: 3 },
  cardVenue: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: 2 },
  cardCity: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, marginBottom: 4, textTransform: 'capitalize' },
  cardMeta: { marginBottom: 4 },
  cardDate: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  free: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.success },
  price: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text },
  priceTbc: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted },
  genreTag: { backgroundColor: theme.colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.full },
  genreText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, textTransform: 'capitalize' },
  distance: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, marginTop: 3 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 4 },
});
