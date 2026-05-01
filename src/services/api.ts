const API_URL = '/api';

export const getAssetUrl = (url?: string) => {
  if (!url) return '';
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  return url.startsWith('/') ? url : `/${url}`;
};

const getHeaders = () => {
  const password = localStorage.getItem('admin_password') || '';
  return {
    'Content-Type': 'application/json',
    'admin-password': password,
  };
};

const getAdminError = (res: Response, action: string) => {
  if (res.status === 401) return 'Parola de admin nu este valida.';
  if (res.status === 404) return `${action} nu este disponibil. Reporneste serverul si incearca din nou.`;
  return `${action} a esuat (${res.status}).`;
};

export const api = {
  // Public
  async getMartialArts() {
    const res = await fetch(`${API_URL}/martial-arts`);
    return res.json();
  },
  async getSchedule() {
    const res = await fetch(`${API_URL}/schedule`);
    return res.json();
  },
  async getCoaches() {
    const res = await fetch(`${API_URL}/coaches`);
    return res.json();
  },
  async getSubscriptions() {
    const res = await fetch(`${API_URL}/subscriptions`);
    return res.json();
  },
  async getFightGalas() {
    const res = await fetch(`${API_URL}/fight-galas`);
    return res.json();
  },
  async getCompetitions() {
    const res = await fetch(`${API_URL}/competitions`);
    return res.json();
  },
  async registerForCompetition(competitionId: string, data: any) {
    const res = await fetch(`${API_URL}/competitions/${competitionId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Parola competitiei nu este corecta.');
      throw new Error('Inscrierea nu a putut fi trimisa.');
    }
    return res.json();
  },
  async getGallery() {
    const res = await fetch(`${API_URL}/gallery`);
    return res.json();
  },
  async getLocationConfigs() {
    const res = await fetch(`${API_URL}/location-configs`);
    return res.json();
  },
  async getDesign() {
    const res = await fetch(`${API_URL}/design`);
    return res.json();
  },
  async getReviews() {
    const res = await fetch(`${API_URL}/reviews`);
    return res.json();
  },
  async submitReview(data: any) {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Recenzia nu a putut fi trimisa.');
    return res.json();
  },
  async sendContactRequest(data: any) {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async getAdminRequests() {
    const res = await fetch(`${API_URL}/admin/requests`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },
  async getAdminReviews() {
    const res = await fetch(`${API_URL}/admin/reviews`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },
  async getCompetitionRegistrations() {
    const res = await fetch(`${API_URL}/admin/registrations`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Admin
  async addItem(tab: string, data: any) {
    const res = await fetch(`${API_URL}/admin/${tab}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(getAdminError(res, 'Salvarea'));
    return res.json();
  },
  async updateItem(tab: string, id: string, data: any) {
    const res = await fetch(`${API_URL}/admin/${tab}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(getAdminError(res, 'Editarea'));
    return res.json();
  },
  async deleteItem(tab: string, id: string) {
    const res = await fetch(`${API_URL}/admin/${tab}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // We can't use generic getHeaders() here because Content-Type must be handled by FormData
    const password = localStorage.getItem('admin_password') || '';
    
    const res = await fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        'admin-password': password,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  async uploadImages(files: File[]) {
    const uploads = await Promise.all(files.map(file => this.uploadImage(file)));
    return uploads;
  },
  async uploadReviewImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/reviews/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};
