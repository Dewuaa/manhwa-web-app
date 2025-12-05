'use client';

import { useState, useEffect } from 'react';
import { manhwaAPI } from '@/lib/api';
import { Manhwa } from '@/lib/types';
import { Discover } from '@/components/zenith/Discover';
import { AtmosphericBackground } from '@/components/zenith/AtmosphericBackground';

export default function GenresPage() {
  const [topManhwa, setTopManhwa] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch popular/trending for the top 10 list
        const result = await manhwaAPI.getPopular();
        setTopManhwa(result?.results || []);
      } catch (error) {
        console.error('Failed to load discover data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <AtmosphericBackground />
      <Discover topManhwa={topManhwa} loading={loading} />
    </>
  );
}
