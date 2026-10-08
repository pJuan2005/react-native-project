import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel = 'mục',
}: PaginationControlsProps) {
  const { isDark, colors } = useAppTheme();

  if (totalPages <= 1) {
    return null;
  }

  // Calculate visible page range (e.g. current page +/- 1 or 2)
  const maxVisiblePages = 4;
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = [];
  for (let p = startPage; p <= endPage; p++) {
    pageNumbers.push(p);
  }

  const startIdx = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <View style={styles.container}>
      {/* Summary Info */}
      {totalItems !== undefined && (
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          Hiển thị {startIdx} - {endIdx} trên tổng số {totalItems} {itemLabel}
        </Text>
      )}

      {/* Navigation Buttons Row */}
      <View style={styles.controlsRow}>
        {/* Previous Button */}
        <Pressable
          style={[
            styles.navBtn,
            { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: colors.cardBorder },
            currentPage <= 1 && styles.navBtnDisabled,
          ]}
          onPress={() => {
            if (currentPage > 1) {
              onPageChange(currentPage - 1);
            }
          }}
          disabled={currentPage <= 1}
          hitSlop={6}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={currentPage <= 1 ? (isDark ? '#475569' : '#94A3B8') : colors.primary}
          />
          <Text
            style={[
              styles.navBtnText,
              { color: currentPage <= 1 ? (isDark ? '#475569' : '#94A3B8') : colors.primary },
            ]}
          >
            Trước
          </Text>
        </Pressable>

        {/* First Page ellipsis if far */}
        {startPage > 1 && (
          <Pressable
            style={[
              styles.pageChip,
              { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: colors.cardBorder },
            ]}
            onPress={() => onPageChange(1)}
          >
            <Text style={[styles.pageChipText, { color: colors.text }]}>1</Text>
          </Pressable>
        )}
        {startPage > 2 && (
          <Text style={[styles.ellipsisText, { color: colors.textSecondary }]}>...</Text>
        )}

        {/* Page Chips */}
        {pageNumbers.map((p) => {
          const isActive = p === currentPage;
          return (
            <Pressable
              key={p}
              style={[
                styles.pageChip,
                { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: colors.cardBorder },
                isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => onPageChange(p)}
            >
              <Text
                style={[
                  styles.pageChipText,
                  { color: colors.text },
                  isActive && { color: '#FFFFFF', fontWeight: '800' },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}

        {/* Last Page ellipsis if far */}
        {endPage < totalPages - 1 && (
          <Text style={[styles.ellipsisText, { color: colors.textSecondary }]}>...</Text>
        )}
        {endPage < totalPages && (
          <Pressable
            style={[
              styles.pageChip,
              { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: colors.cardBorder },
            ]}
            onPress={() => onPageChange(totalPages)}
          >
            <Text style={[styles.pageChipText, { color: colors.text }]}>{totalPages}</Text>
          </Pressable>
        )}

        {/* Next Button */}
        <Pressable
          style={[
            styles.navBtn,
            { backgroundColor: isDark ? '#1C2541' : '#FFFFFF', borderColor: colors.cardBorder },
            currentPage >= totalPages && styles.navBtnDisabled,
          ]}
          onPress={() => {
            if (currentPage < totalPages) {
              onPageChange(currentPage + 1);
            }
          }}
          disabled={currentPage >= totalPages}
          hitSlop={6}
        >
          <Text
            style={[
              styles.navBtnText,
              { color: currentPage >= totalPages ? (isDark ? '#475569' : '#94A3B8') : colors.primary },
            ]}
          >
            Sau
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={currentPage >= totalPages ? (isDark ? '#475569' : '#94A3B8') : colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  navBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pageChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ellipsisText: {
    fontSize: 12,
    paddingHorizontal: 2,
    fontWeight: '700',
  },
});
