import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config/api';
import { useAuth } from '../../../App';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2;
// const API_URL = 'http://192.168.57.154:8081/api';

interface Recipe {
    recipeId: number;
    title: string;
    imageUrl?: string;
    likeCount: number;
    viewCount: number;
    cookTime?: number;
}

export default function HomeScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
    const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [popRes, trendRes] = await Promise.all([
                fetch(`${API_URL}/recipes/popular`),
                fetch(`${API_URL}/recipes/trending`),
            ]);

            if (popRes.ok) {
                const data = await popRes.json();
                if (Array.isArray(data)) setPopularRecipes(data.slice(0, 6));
            }

            if (trendRes.ok) {
                const data = await trendRes.json();
                if (Array.isArray(data)) setTrendingRecipes(data.slice(0, 6));
            }
        } catch (e) {
            console.log('Error loading data:', e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const renderRecipeCard = ({ item }: { item: Recipe }) => (
        <TouchableOpacity style={styles.recipeCard}>
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }}
                style={styles.recipeImage}
            />
            <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.recipeStats}>
                    <View style={styles.stat}>
                        <Ionicons name="heart" size={14} color="#EF5350" />
                        <Text style={styles.statText}>{item.likeCount}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="eye" size={14} color="#99A1A7" />
                        <Text style={styles.statText}>{item.viewCount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Xin chào! 👋</Text>
                <Text style={styles.headerTitle}>Bạn muốn nấu gì hôm nay?</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#99A1A7" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm công thức..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Popular */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Phổ biến</Text>
                <FlatList
                    data={popularRecipes}
                    renderItem={renderRecipeCard}
                    keyExtractor={(item) => `pop-${item.recipeId}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recipesList}
                />
            </View>

            {/* Trending */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Trending</Text>
                <FlatList
                    data={trendingRecipes}
                    renderItem={renderRecipeCard}
                    keyExtractor={(item) => `trend-${item.recipeId}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recipesList}
                />
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    header: {
        backgroundColor: '#003459',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
    headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        marginTop: -20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    section: { marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#00171F', paddingHorizontal: 24, marginBottom: 12 },
    recipesList: { paddingHorizontal: 24 },
    recipeCard: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginRight: 16,
        overflow: 'hidden',
    },
    recipeImage: { width: '100%', height: 120, backgroundColor: '#E8EAED' },
    recipeInfo: { padding: 12 },
    recipeTitle: { fontSize: 14, fontWeight: '600', color: '#00171F', marginBottom: 8 },
    recipeStats: { flexDirection: 'row' },
    stat: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    statText: { fontSize: 12, color: '#99A1A7', marginLeft: 4 },
});
