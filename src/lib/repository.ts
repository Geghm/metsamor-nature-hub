import { SETTLEMENTS, TREASURES, type Settlement, type Treasure } from "@/data/content";

/**
 * Data access layer. Currently reads bundled local data — nothing is persisted.
 * Integration point: when a backend is connected, swap these implementations for
 * database queries (same signatures) and keep UI code unchanged.
 */
export const repository = {
  async listTreasures(): Promise<Treasure[]> {
    return TREASURES;
  },
  async getTreasure(slug: string): Promise<Treasure | undefined> {
    return TREASURES.find((t) => t.slug === slug);
  },
  async listSettlements(): Promise<Settlement[]> {
    return SETTLEMENTS;
  },
};
