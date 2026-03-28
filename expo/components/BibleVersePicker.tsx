import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Search, X, ChevronRight, Book } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

interface BibleBook {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
  abbreviation: string;
}

interface BibleVersePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reference: string) => void;
  initialValue?: string;
}

const BIBLE_BOOKS: BibleBook[] = [
  // Antiguo Testamento
  { id: 'gen', name: 'Génesis', testament: 'old', chapters: 50, abbreviation: 'Gn' },
  { id: 'exo', name: 'Éxodo', testament: 'old', chapters: 40, abbreviation: 'Ex' },
  { id: 'lev', name: 'Levítico', testament: 'old', chapters: 27, abbreviation: 'Lv' },
  { id: 'num', name: 'Números', testament: 'old', chapters: 36, abbreviation: 'Nm' },
  { id: 'deu', name: 'Deuteronomio', testament: 'old', chapters: 34, abbreviation: 'Dt' },
  { id: 'jos', name: 'Josué', testament: 'old', chapters: 24, abbreviation: 'Jos' },
  { id: 'jdg', name: 'Jueces', testament: 'old', chapters: 21, abbreviation: 'Jue' },
  { id: 'rut', name: 'Rut', testament: 'old', chapters: 4, abbreviation: 'Rt' },
  { id: '1sa', name: '1 Samuel', testament: 'old', chapters: 31, abbreviation: '1 S' },
  { id: '2sa', name: '2 Samuel', testament: 'old', chapters: 24, abbreviation: '2 S' },
  { id: '1ki', name: '1 Reyes', testament: 'old', chapters: 22, abbreviation: '1 R' },
  { id: '2ki', name: '2 Reyes', testament: 'old', chapters: 25, abbreviation: '2 R' },
  { id: '1ch', name: '1 Crónicas', testament: 'old', chapters: 29, abbreviation: '1 Cr' },
  { id: '2ch', name: '2 Crónicas', testament: 'old', chapters: 36, abbreviation: '2 Cr' },
  { id: 'ezr', name: 'Esdras', testament: 'old', chapters: 10, abbreviation: 'Esd' },
  { id: 'neh', name: 'Nehemías', testament: 'old', chapters: 13, abbreviation: 'Neh' },
  { id: 'est', name: 'Ester', testament: 'old', chapters: 10, abbreviation: 'Est' },
  { id: 'job', name: 'Job', testament: 'old', chapters: 42, abbreviation: 'Job' },
  { id: 'psa', name: 'Salmos', testament: 'old', chapters: 150, abbreviation: 'Sal' },
  { id: 'pro', name: 'Proverbios', testament: 'old', chapters: 31, abbreviation: 'Pr' },
  { id: 'ecc', name: 'Eclesiastés', testament: 'old', chapters: 12, abbreviation: 'Ec' },
  { id: 'sng', name: 'Cantares', testament: 'old', chapters: 8, abbreviation: 'Cnt' },
  { id: 'isa', name: 'Isaías', testament: 'old', chapters: 66, abbreviation: 'Is' },
  { id: 'jer', name: 'Jeremías', testament: 'old', chapters: 52, abbreviation: 'Jr' },
  { id: 'lam', name: 'Lamentaciones', testament: 'old', chapters: 5, abbreviation: 'Lm' },
  { id: 'ezk', name: 'Ezequiel', testament: 'old', chapters: 48, abbreviation: 'Ez' },
  { id: 'dan', name: 'Daniel', testament: 'old', chapters: 12, abbreviation: 'Dn' },
  { id: 'hos', name: 'Oseas', testament: 'old', chapters: 14, abbreviation: 'Os' },
  { id: 'jol', name: 'Joel', testament: 'old', chapters: 3, abbreviation: 'Jl' },
  { id: 'amo', name: 'Amós', testament: 'old', chapters: 9, abbreviation: 'Am' },
  { id: 'oba', name: 'Abdías', testament: 'old', chapters: 1, abbreviation: 'Abd' },
  { id: 'jon', name: 'Jonás', testament: 'old', chapters: 4, abbreviation: 'Jon' },
  { id: 'mic', name: 'Miqueas', testament: 'old', chapters: 7, abbreviation: 'Mi' },
  { id: 'nam', name: 'Nahúm', testament: 'old', chapters: 3, abbreviation: 'Nah' },
  { id: 'hab', name: 'Habacuc', testament: 'old', chapters: 3, abbreviation: 'Hab' },
  { id: 'zep', name: 'Sofonías', testament: 'old', chapters: 3, abbreviation: 'Sof' },
  { id: 'hag', name: 'Hageo', testament: 'old', chapters: 2, abbreviation: 'Hag' },
  { id: 'zec', name: 'Zacarías', testament: 'old', chapters: 14, abbreviation: 'Zac' },
  { id: 'mal', name: 'Malaquías', testament: 'old', chapters: 4, abbreviation: 'Mal' },
  // Nuevo Testamento
  { id: 'mat', name: 'Mateo', testament: 'new', chapters: 28, abbreviation: 'Mt' },
  { id: 'mrk', name: 'Marcos', testament: 'new', chapters: 16, abbreviation: 'Mr' },
  { id: 'luk', name: 'Lucas', testament: 'new', chapters: 24, abbreviation: 'Lc' },
  { id: 'jhn', name: 'Juan', testament: 'new', chapters: 21, abbreviation: 'Jn' },
  { id: 'act', name: 'Hechos', testament: 'new', chapters: 28, abbreviation: 'Hch' },
  { id: 'rom', name: 'Romanos', testament: 'new', chapters: 16, abbreviation: 'Ro' },
  { id: '1co', name: '1 Corintios', testament: 'new', chapters: 16, abbreviation: '1 Co' },
  { id: '2co', name: '2 Corintios', testament: 'new', chapters: 13, abbreviation: '2 Co' },
  { id: 'gal', name: 'Gálatas', testament: 'new', chapters: 6, abbreviation: 'Gá' },
  { id: 'eph', name: 'Efesios', testament: 'new', chapters: 6, abbreviation: 'Ef' },
  { id: 'php', name: 'Filipenses', testament: 'new', chapters: 4, abbreviation: 'Fil' },
  { id: 'col', name: 'Colosenses', testament: 'new', chapters: 4, abbreviation: 'Col' },
  { id: '1th', name: '1 Tesalonicenses', testament: 'new', chapters: 5, abbreviation: '1 Ts' },
  { id: '2th', name: '2 Tesalonicenses', testament: 'new', chapters: 3, abbreviation: '2 Ts' },
  { id: '1ti', name: '1 Timoteo', testament: 'new', chapters: 6, abbreviation: '1 Ti' },
  { id: '2ti', name: '2 Timoteo', testament: 'new', chapters: 4, abbreviation: '2 Ti' },
  { id: 'tit', name: 'Tito', testament: 'new', chapters: 3, abbreviation: 'Tit' },
  { id: 'phm', name: 'Filemón', testament: 'new', chapters: 1, abbreviation: 'Flm' },
  { id: 'heb', name: 'Hebreos', testament: 'new', chapters: 13, abbreviation: 'He' },
  { id: 'jas', name: 'Santiago', testament: 'new', chapters: 5, abbreviation: 'Stg' },
  { id: '1pe', name: '1 Pedro', testament: 'new', chapters: 5, abbreviation: '1 P' },
  { id: '2pe', name: '2 Pedro', testament: 'new', chapters: 3, abbreviation: '2 P' },
  { id: '1jn', name: '1 Juan', testament: 'new', chapters: 5, abbreviation: '1 Jn' },
  { id: '2jn', name: '2 Juan', testament: 'new', chapters: 1, abbreviation: '2 Jn' },
  { id: '3jn', name: '3 Juan', testament: 'new', chapters: 1, abbreviation: '3 Jn' },
  { id: 'jud', name: 'Judas', testament: 'new', chapters: 1, abbreviation: 'Jud' },
  { id: 'rev', name: 'Apocalipsis', testament: 'new', chapters: 22, abbreviation: 'Ap' },
];

const { width: screenWidth } = Dimensions.get('window');

export default function BibleVersePicker({
  visible,
  onClose,
  onSelect,
  initialValue,
}: BibleVersePickerProps) {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const [step, setStep] = useState<'book' | 'chapter' | 'verse'>('book');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerseStart, setSelectedVerseStart] = useState<number | null>(null);
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showTestament, setShowTestament] = useState<'all' | 'old' | 'new'>('all');
  const [versesInChapter, setVersesInChapter] = useState<number>(50);

  const filteredBooks = BIBLE_BOOKS.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          book.abbreviation.toLowerCase().includes(searchText.toLowerCase());
    const matchesTestament = showTestament === 'all' || book.testament === showTestament;
    return matchesSearch && matchesTestament;
  });

  useEffect(() => {
    if (initialValue) {
      // Parse initial value like "Juan 3:16" or "Juan 3:16-18"
      const match = initialValue.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
      if (match) {
        const [, bookName, chapter, verseStart, verseEnd] = match;
        const book = BIBLE_BOOKS.find(b => 
          b.name.toLowerCase() === bookName.toLowerCase() ||
          b.abbreviation.toLowerCase() === bookName.toLowerCase()
        );
        if (book) {
          setSelectedBook(book);
          setSelectedChapter(parseInt(chapter));
          setSelectedVerseStart(parseInt(verseStart));
          if (verseEnd) setSelectedVerseEnd(parseInt(verseEnd));
          setStep('verse');
        }
      }
    }
  }, [initialValue]);

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerseStart(null);
    setSelectedVerseEnd(null);
    setStep('chapter');
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerseStart(null);
    setSelectedVerseEnd(null);
    // In a real app, you'd fetch the actual number of verses for this chapter
    // For now, we'll use a default
    setVersesInChapter(getEstimatedVerses(selectedBook?.id || '', chapter));
    setStep('verse');
  };

  const handleVerseSelect = (verse: number) => {
    if (!selectedVerseStart) {
      setSelectedVerseStart(verse);
    } else if (!selectedVerseEnd && verse !== selectedVerseStart) {
      const start = Math.min(selectedVerseStart, verse);
      const end = Math.max(selectedVerseStart, verse);
      setSelectedVerseStart(start);
      setSelectedVerseEnd(end);
    } else {
      setSelectedVerseStart(verse);
      setSelectedVerseEnd(null);
    }
  };

  const handleConfirm = () => {
    if (selectedBook && selectedChapter && selectedVerseStart) {
      const reference = selectedVerseEnd
        ? `${selectedBook.name} ${selectedChapter}:${selectedVerseStart}-${selectedVerseEnd}`
        : `${selectedBook.name} ${selectedChapter}:${selectedVerseStart}`;
      onSelect(reference);
      resetSelection();
    }
  };

  const resetSelection = () => {
    setStep('book');
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerseStart(null);
    setSelectedVerseEnd(null);
    setSearchText('');
    setShowTestament('all');
  };

  const handleClose = () => {
    resetSelection();
    onClose();
  };

  const getEstimatedVerses = (bookId: string, chapter: number): number => {
    // This is a simplified estimation. In a real app, you'd have actual verse counts
    const longChapters = ['psa', 'pro', 'isa', 'jer', 'ezk'];
    if (longChapters.includes(bookId)) return 70;
    if (bookId === 'psa' && chapter === 119) return 176;
    return 30;
  };

  const renderBookList = () => (
    <>
      <View style={styles.testamentTabs}>
        <TouchableOpacity
          style={[
            styles.testamentTab,
            showTestament === 'all' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setShowTestament('all')}
        >
          <Text style={[
            styles.testamentTabText,
            { color: showTestament === 'all' ? 'white' : colors.text }
          ]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.testamentTab,
            showTestament === 'old' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setShowTestament('old')}
        >
          <Text style={[
            styles.testamentTabText,
            { color: showTestament === 'old' ? 'white' : colors.text }
          ]}>A.T.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.testamentTab,
            showTestament === 'new' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setShowTestament('new')}
        >
          <Text style={[
            styles.testamentTabText,
            { color: showTestament === 'new' ? 'white' : colors.text }
          ]}>N.T.</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listItem, { backgroundColor: colors.surface }]}
            onPress={() => handleBookSelect(item)}
          >
            <View style={styles.bookInfo}>
              <Text style={[styles.bookName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.bookAbbr, { color: colors.textSecondary }]}>
                {item.abbreviation} • {item.chapters} capítulos
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </>
  );

  const renderChapterGrid = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.gridContainer}>
        {Array.from({ length: selectedBook?.chapters || 0 }, (_, i) => i + 1).map((chapter) => (
          <TouchableOpacity
            key={chapter}
            style={[
              styles.gridItem,
              { backgroundColor: colors.surface },
              selectedChapter === chapter && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleChapterSelect(chapter)}
          >
            <Text style={[
              styles.gridItemText,
              { color: selectedChapter === chapter ? 'white' : colors.text }
            ]}>
              {chapter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderVerseGrid = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.selectionInfo}>
        <Text style={[styles.selectionText, { color: colors.text }]}>
          {selectedBook?.name} {selectedChapter}
          {selectedVerseStart && `:${selectedVerseStart}`}
          {selectedVerseEnd && `-${selectedVerseEnd}`}
        </Text>
        {selectedVerseStart && (
          <Text style={[styles.selectionHint, { color: colors.textSecondary }]}>
            Toca otro versículo para seleccionar un rango
          </Text>
        )}
      </View>
      <View style={styles.gridContainer}>
        {Array.from({ length: versesInChapter }, (_, i) => i + 1).map((verse) => {
          const isSelected = selectedVerseStart === verse || 
                           (selectedVerseStart && selectedVerseEnd && 
                            verse >= selectedVerseStart && verse <= selectedVerseEnd);
          return (
            <TouchableOpacity
              key={verse}
              style={[
                styles.gridItem,
                { backgroundColor: colors.surface },
                isSelected && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleVerseSelect(verse)}
            >
              <Text style={[
                styles.gridItemText,
                { color: isSelected ? 'white' : colors.text }
              ]}>
                {verse}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Seleccionar Versículo
          </Text>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedVerseStart}
            style={{ opacity: selectedVerseStart ? 1 : 0.3 }}
          >
            <Text style={[styles.confirmText, { color: colors.primary }]}>
              Confirmar
            </Text>
          </TouchableOpacity>
        </View>

        {step !== 'book' && (
          <View style={styles.breadcrumb}>
            <TouchableOpacity
              style={[styles.breadcrumbItem, { backgroundColor: colors.surface }]}
              onPress={() => setStep('book')}
            >
              <Book size={16} color={colors.primary} />
              <Text style={[styles.breadcrumbText, { color: colors.text }]}>
                {selectedBook?.name || 'Libro'}
              </Text>
            </TouchableOpacity>
            {selectedChapter && (
              <>
                <ChevronRight size={16} color={colors.textSecondary} />
                <TouchableOpacity
                  style={[styles.breadcrumbItem, { backgroundColor: colors.surface }]}
                  onPress={() => setStep('chapter')}
                >
                  <Text style={[styles.breadcrumbText, { color: colors.text }]}>
                    Cap. {selectedChapter}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {step === 'book' && (
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar libro..."
                placeholderTextColor={colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>
        )}

        <View style={styles.content}>
          {step === 'book' && renderBookList()}
          {step === 'chapter' && renderChapterGrid()}
          {step === 'verse' && renderVerseGrid()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  testamentTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  testamentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  testamentTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookAbbr: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  gridItem: {
    width: (screenWidth - 40 - 48) / 5,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  gridItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionInfo: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectionHint: {
    fontSize: 12,
  },
});