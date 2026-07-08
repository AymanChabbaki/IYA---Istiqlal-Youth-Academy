import api from '../lib/api';

export interface Committee {
  id: string;
  name: string;
  nameAr?: string | null;
  createdAt: string;
}

export const committeeService = {
  async getCommittees(): Promise<Committee[]> {
    const response = await api.get('/committees');
    return response.data.committees;
  },

  async createCommittee(data: { name: string; nameAr?: string }) {
    const response = await api.post('/committees', data);
    return response.data.committee;
  },

  async updateCommittee(id: string, data: { name?: string; nameAr?: string }) {
    const response = await api.patch(`/committees/${id}`, data);
    return response.data.committee;
  },

  async deleteCommittee(id: string) {
    await api.delete(`/committees/${id}`);
  },
};
