import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../services/theme';
import { searchPerformances } from '../services/api';

const GENRES = ['drama','musical','comedy','opera','dance','ballet','immersive','childrens','pantomime','cabaret','circus','family'];
const REGIONS = ['london','south_east','south_west','east_of_england','east_midlands','west_midlands','yorkshire','north_west','north_east','scotland','wales','northern_ireland'];
const REGION_LABELS = {
  london: 'London', south_east: 'South East', south_west: 'South West',
  east_of_england: 'East of England', east_midlands: 'East Midlands',
  west_midlands: 'West Midlands', yorkshire: 'Yorkshire',
  north_west: 'North West', north_east: 'North East',
  scotland: 'Scotland', wales: 'Wales', northern_ireland: 'Northern Ireland'
};

function getDateString(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export default function SearchScreen({ navigation }) {
  const [fromDate, setFromDate] = useState(getDateString(0));
  const [toDate, setToDate] = useState(getDateString(30));
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [accessible, setAccessible] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleItem(list, setList, item) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  }

  async function handleSearch() {
    if (!fromDate || !toDate) {
      Alert.alert('Missing dates', 'Please enter a date range');
      return;
    }
    setLoading(true);
    try {
  const searchParams = {
    from: fromDate,
    to: toDate,
    genres: selectedGenres,
    regions: selectedRegions,
    max_price: maxPrice || null,
    free_only: freeOnly,
    accessible,
  };

  const response = await searchPerformances(searchParams);

  navigation.navigate('Results', {
  initialResults: response.results,
  total: response.total,
  searchParams,
});

} catch (err) {
  Alert.alert('Search failed', 'Please check your connection and try again');
} finally {
  setLoading(false);
}

  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎭</Text>
          <Text style={styles.title}>Stage Seek</Text>
          <Text style={styles.subtitle}>Find theatre across the UK</Text>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHEN</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From</Text>
              <TextInput
                style={styles.dateInput}
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.dateSep} />
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To</Text>
              <TextInput
                style={styles.dateInput}
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>
          {/* Quick date buttons */}
          <View style={styles.quickDates}>
            {[
              { label: 'This week', days: 7 },
              { label: 'This month', days: 30 },
              { label: 'Next 3 months', days: 90 },
            ].map(({ label, days }) => (
              <TouchableOpacity
                key={label}
                style={styles.quickDate}
                onPress={() => { setFromDate(getDateString(0)); setToDate(getDateString(days)); }}
              >
                <Text style={styles.quickDateText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHERE</Text>
          <View style={styles.chips}>
            {REGIONS.map(region => (
              <TouchableOpacity
                key={region}
                style={[styles.chip, selectedRegions.includes(region) && styles.chipActive]}
                onPress={() => toggleItem(selectedRegions, setSelectedRegions, region)}
              >
                <Text style={[styles.chipText, selectedRegions.includes(region) && styles.chipTextActive]}>
                  {REGION_LABELS[region]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENRE</Text>
          <View style={styles.chips}>
            {GENRES.map(genre => (
              <TouchableOpacity
                key={genre}
                style={[styles.chip, selectedGenres.includes(genre) && styles.chipActive]}
                onPress={() => toggleItem(selectedGenres, setSelectedGenres, genre)}
              >
                <Text style={[styles.chipText, selectedGenres.includes(genre) && styles.chipTextActive]}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRICE</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="Max price (e.g. 30)"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.toggle, freeOnly && styles.toggleActive]}
              onPress={() => setFreeOnly(!freeOnly)}
            >
              <Text style={[styles.toggleText, freeOnly && styles.toggleTextActive]}>Free only</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCESSIBILITY</Text>
          <TouchableOpacity
            style={[styles.toggle, accessible && styles.toggleActive]}
            onPress={() => setAccessible(!accessible)}
          >
            <Text style={[styles.toggleText, accessible && styles.toggleTextActive]}>
              Accessible performances only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchBtnText}>Find Shows</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md, paddingBottom: 40 },
  header: { alignItems: 'center', paddingVertical: theme.spacing.xl },
  logo: { fontSize: 48 },
  title: { fontSize: theme.fontSize.xxxl, fontWeight: '700', color: theme.colors.text, marginTop: 8 },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 4 },
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: theme.fontSize.xs, fontWeight: '700', color: theme.colors.primary, letterSpacing: 1.5, marginBottom: theme.spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateField: { flex: 1 },
  dateLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: 4 },
  dateInput: { backgroundColor: theme.colors.surface, color: theme.colors.text, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, fontSize: theme.fontSize.md, borderWidth: 1, borderColor: theme.colors.border },
  dateSep: { width: 16 },
  quickDates: { flexDirection: 'row', marginTop: theme.spacing.sm, gap: 8 },
  quickDate: { flex: 1, backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  quickDateText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  priceRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  priceInput: { flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.text, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, fontSize: theme.fontSize.md, borderWidth: 1, borderColor: theme.colors.border },
  toggle: { paddingHorizontal: 12, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  toggleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  searchBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.md },
  searchBtnText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: '700' },
});
