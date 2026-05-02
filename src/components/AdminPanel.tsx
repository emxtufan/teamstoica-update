import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api, getAssetUrl } from '../services/api';
import { createLegacyPalmaresCards, defaultPalmaresProfiles, normalizePalmaresProfiles } from '../lib/palmares';
import { 
	  Settings, Trash2, Plus, 
		  Dumbbell, Calendar, Users, 
			  Image as ImageIcon,
			  LogOut, ShieldCheck, X, Inbox, Trophy, ClipboardList, Award, MonitorPlay, ChevronDown, MapPin, MessageSquare, Star
			} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('martial-arts');
  const [items, setItems] = useState<any[]>([]);
  const [coachOptions, setCoachOptions] = useState<any[]>([]);
  const [registrationOptions, setRegistrationOptions] = useState<any[]>([]);
  const [locationConfigOptions, setLocationConfigOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [expandedRegistrationGroups, setExpandedRegistrationGroups] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const serializePalmaresCards = (profiles: any[] = []) => (
    profiles
      .slice(0, 2)
      .map((profile) => [
        profile?.name || '',
        profile?.title || '',
        profile?.record || '',
        profile?.biography || '',
        profile?.highlight || '',
      ].join(' | '))
      .join('\n')
  );

  const parsePalmaresCardsInput = (value: string, profiles: any[] = []) => {
    const nextProfiles = normalizePalmaresProfiles({ palmaresProfiles: profiles });

    String(value || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2)
      .forEach((line, index) => {
        const [name = '', title = '', record = '', biography = '', highlight = ''] = line
          .split('|')
          .map(part => part.trim());
        const currentProfile = nextProfiles[index] || defaultPalmaresProfiles[index] || defaultPalmaresProfiles[0];

        nextProfiles[index] = {
          ...currentProfile,
          slug: currentProfile.slug,
          name: name || currentProfile.name,
          title,
          record,
          biography,
          highlight,
        };
      });

    return nextProfiles;
  };

  const buildDesignItem = (item: any = {}) => {
    const palmaresProfiles = normalizePalmaresProfiles(item);

    return {
      ...item,
      key: 'main',
      heroMedia: item.heroMedia || '',
      heroMediaMobile: item.heroMediaMobile || '',
      heroMediaDesktop: item.heroMediaDesktop || '',
      heroMediaType: item.heroMediaType || '',
      heroMediaMobileType: item.heroMediaMobileType || '',
      siteLogo: item.siteLogo || '',
      ctaSectionPhoto: item.ctaSectionPhoto || '',
      instagramUrl: item.instagramUrl || '',
      facebookUrl: item.facebookUrl || '',
      youtubeUrl: item.youtubeUrl || '',
      whatsappUrl: item.whatsappUrl || '',
      palmaresProfiles,
      palmaresCardsText: serializePalmaresCards(palmaresProfiles),
      palmaresCards: createLegacyPalmaresCards(palmaresProfiles),
    };
  };

  const isVideoAsset = (url?: string, type?: string) => {
    if (type === 'video') return true;
    if (type === 'image') return false;
    return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(url || ''));
  };

  useEffect(() => {
    const savedPass = localStorage.getItem('admin_password');
    if (savedPass) {
      setPassword(savedPass);
      api.getAdminRequests()
        .then(() => setIsLoggedIn(true))
        .catch(() => {
          localStorage.removeItem('admin_password');
          setPassword('');
          setIsLoggedIn(false);
        });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      const shouldLoadCoaches = ['schedule', 'coaches', 'competitions'].includes(activeTab);
      const shouldLoadRegistrations = ['competitions', 'registrations'].includes(activeTab);
      const shouldLoadLocationConfigs = ['schedule', 'config', 'coaches', 'design'].includes(activeTab);
      const coaches = shouldLoadCoaches ? await api.getCoaches() : coachOptions;
      const registrations = shouldLoadRegistrations ? await api.getCompetitionRegistrations() : registrationOptions;
      const locationConfigs = shouldLoadLocationConfigs ? await api.getLocationConfigs() : locationConfigOptions;

      if (shouldLoadCoaches) {
        setCoachOptions(Array.isArray(coaches) ? coaches : []);
      }

      if (shouldLoadRegistrations) {
        setRegistrationOptions(Array.isArray(registrations) ? registrations : []);
      }

      if (shouldLoadLocationConfigs) {
        setLocationConfigOptions(Array.isArray(locationConfigs) ? locationConfigs : []);
      }

      switch (activeTab) {
	        case 'martial-arts': data = await api.getMartialArts(); break;
	        case 'schedule': data = await api.getSchedule(); break;
	        case 'design':
	          data = await api.getDesign().then(result => [buildDesignItem(result || {})]);
	          break;
	        case 'coaches': data = Array.isArray(coaches) ? coaches : []; break;
	        case 'subscriptions': data = await api.getSubscriptions(); break;
	        case 'fight-galas': data = await api.getFightGalas(); break;
	        case 'competitions': data = await api.getCompetitions(); break;
        case 'config': data = Array.isArray(locationConfigs) ? locationConfigs : []; break;
        case 'registrations': data = Array.isArray(registrations) ? registrations : []; break;
	        case 'gallery': data = await api.getGallery(); break;
	        case 'requests': data = await api.getAdminRequests(); break;
	        case 'reviews': data = await api.getAdminReviews(); break;
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin_password', password);
    try {
      await api.getAdminRequests();
      setIsLoggedIn(true);
    } catch (error) {
      localStorage.removeItem('admin_password');
      alert('Parola de admin nu este valida.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setIsLoggedIn(false);
    setPassword('');
    navigate('/');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest element?')) return;
    try {
      await api.deleteItem(activeTab === 'config' ? 'location-configs' : activeTab, id);
      setItems(items.filter(i => i._id !== id));
    } catch (error) {
      alert('Error deleting item. Check password.');
    }
  };

  const createSlug = (value: string) => (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );

  const parseLines = (value: any) => (
    Array.isArray(value)
      ? value
      : String(value || '')
          .split('\n')
          .map(detail => detail.trim())
          .filter(Boolean)
  );

  const getLocationConfigMatch = (value?: string) => {
    const normalizedValue = createSlug(value || '');
    return locationConfigOptions.find((location: any) => (
      (location._id && String(location._id) === String(value || ''))
      || createSlug(location.name || '') === normalizedValue
    ));
  };

  const normalizeCoachTrainingSchedule = (value: any) => (
    Array.isArray(value)
      ? value
          .map((session: any) => ({
            time: session?.time || '',
            location: session?.location || '',
            title: session?.title || '',
          }))
          .filter((session: any) => session.time || session.location || session.title)
      : String(value || '')
          .split('\n')
          .map(line => {
            const [time = '', location = '', title = ''] = line.split('|').map(part => part.trim());
            return { time, location, title };
          })
          .filter(session => session.time || session.location || session.title)
  );

  const normalizeCoachLocations = (value: any) => (
    Array.isArray(value)
      ? value
          .map((location: any) => ({
            configId: location?.configId || getLocationConfigMatch(location?.configId || location?.name)?._id || '',
            name: location?.name || '',
            address: location?.address || '',
            schedule: location?.schedule || '',
          }))
          .filter((location: any) => location.configId || location.name || location.address || location.schedule)
      : String(value || '')
          .split('\n')
          .map(line => {
            const [name = '', address = '', schedule = ''] = line.split('|').map(part => part.trim());
            return {
              configId: getLocationConfigMatch(name)?._id || '',
              name,
              address,
              schedule,
            };
          })
          .filter(location => location.configId || location.name || location.address || location.schedule)
  );

  const buildCoachEditingItem = (item: any = {}) => ({
    ...item,
    id: item.id || createSlug(item.name || ''),
    bio: item.bio || item.description || '',
    description: item.description || item.bio || '',
    specialties: Array.isArray(item.specialties)
      ? item.specialties.join('\n')
      : Array.isArray(item.specializations)
        ? item.specializations.join('\n')
        : item.specialties || item.specializations || '',
    trainingSchedule: normalizeCoachTrainingSchedule(item.trainingSchedule),
    locations: normalizeCoachLocations(item.locations),
    privateDetails: Array.isArray(item.privateDetails) ? item.privateDetails.join('\n') : item.privateDetails || '',
    groupDetails: Array.isArray(item.groupDetails) ? item.groupDetails.join('\n') : item.groupDetails || '',
  });

  const updateCoachCollectionItem = (
    field: 'trainingSchedule' | 'locations',
    index: number,
    key: string,
    value: string,
  ) => {
    setEditingItem((current: any) => {
      const currentItems = Array.isArray(current?.[field]) ? current[field] : [];
      return {
        ...current,
        [field]: currentItems.map((entry: any, entryIndex: number) => (
          entryIndex === index ? { ...entry, [key]: value } : entry
        )),
      };
    });
  };

  const addCoachCollectionItem = (
    field: 'trainingSchedule' | 'locations',
    itemFactory: () => Record<string, string>,
  ) => {
    setEditingItem((current: any) => ({
      ...current,
      [field]: [...(Array.isArray(current?.[field]) ? current[field] : []), itemFactory()],
    }));
  };

  const removeCoachCollectionItem = (field: 'trainingSchedule' | 'locations', index: number) => {
    setEditingItem((current: any) => ({
      ...current,
      [field]: (Array.isArray(current?.[field]) ? current[field] : []).filter((_: any, entryIndex: number) => entryIndex !== index),
    }));
  };

	  const getRegistrationsByCoach = (competition: any) => {
    const competitionRegistrations = registrationOptions.filter(registration => registration.competitionId === competition._id);
    const coachRows = (competition.coaches || []).map((coach: any) => ({
      coach,
      registrations: competitionRegistrations.filter(registration => registration.coachId === coach.id || registration.coachName === coach.name),
    }));
    const unassigned = competitionRegistrations.filter(registration => !registration.coachId && !registration.coachName);

    return unassigned.length > 0
      ? [...coachRows, { coach: { id: 'unassigned', name: 'Fara antrenor' }, registrations: unassigned }]
      : coachRows;
	  };

  const toggleRegistrationGroup = (groupKey: string) => {
    setExpandedRegistrationGroups(current => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

	  const getInitials = (value?: string) => (
	    String(value || '?')
	      .split(' ')
	      .map(part => part[0])
	      .join('')
	      .slice(0, 2)
	      .toUpperCase()
	  );

  const prepareItemForSave = (item: any) => {
    const { _id, __v, _designId, designSection, ...cleanItem } = item;

    if (activeTab === 'coaches') {
      const specialties = parseLines(cleanItem.specialties || cleanItem.specializations);
      const trainingSchedule = normalizeCoachTrainingSchedule(cleanItem.trainingSchedule);

        return {
          ...cleanItem,
          id: cleanItem.id || createSlug(cleanItem.name || ''),
          bio: cleanItem.bio || cleanItem.description || '',
          description: cleanItem.description || cleanItem.bio || '',
          specialties,
          specializations: specialties,
          trainingSchedule,
        locations: normalizeCoachLocations(cleanItem.locations)
          .map((location: any) => {
            const matchedLocation = getLocationConfigMatch(location.configId || location.name);

            return {
              configId: matchedLocation?._id || location.configId || '',
              name: matchedLocation?.name || location.name || '',
              address: matchedLocation?.address || location.address || '',
              schedule: location.schedule || '',
            };
          })
          .filter((location: any) => location.configId || location.name || location.address || location.schedule),
        privatePrice: cleanItem.privatePrice || cleanItem.basePrice || '',
        privateDetails: parseLines(cleanItem.privateDetails),
        groupDetails: parseLines(cleanItem.groupDetails),
      };
    }

    if (activeTab === 'design') {
      const section = designSection || 'hero';

      if (section === 'location-config') {
        return {
          name: cleanItem.name || '',
          address: cleanItem.address || '',
          wazeUrl: cleanItem.wazeUrl || '',
          googleMapsUrl: cleanItem.googleMapsUrl || '',
          image: cleanItem.image || '',
        };
      }

      const designItem = buildDesignItem(cleanItem);

      if (section === 'palmares') {
        const palmaresProfiles = normalizePalmaresProfiles(designItem);
        const profileIndex = Number(cleanItem.profileIndex || 0);
        const currentProfile = palmaresProfiles[profileIndex] || defaultPalmaresProfiles[profileIndex] || defaultPalmaresProfiles[0];

        palmaresProfiles[profileIndex] = {
          ...currentProfile,
          slug: currentProfile.slug,
          name: cleanItem.name || currentProfile.name,
          title: cleanItem.title || '',
          record: cleanItem.record || '',
          biography: cleanItem.biography || '',
          highlight: cleanItem.highlight || '',
          matches: cleanItem.matches || '',
          wins: cleanItem.wins || '',
          kos: cleanItem.kos || '',
          importantGalas: parseLines(cleanItem.importantGalas),
          tournaments: parseLines(cleanItem.tournaments),
          awards: parseLines(cleanItem.awards),
        };

        return {
          ...designItem,
          key: 'main',
          palmaresProfiles,
          palmaresCards: createLegacyPalmaresCards(palmaresProfiles),
        };
      }

      const media = cleanItem.heroMedia || '';
      const lowerMedia = String(media).toLowerCase();
      const isVideo = /\.(mp4|webm|ogg|mov)(\?|#|$)/.test(lowerMedia);
      const palmaresProfiles = typeof cleanItem.palmaresCardsText === 'string'
        ? parsePalmaresCardsInput(cleanItem.palmaresCardsText, designItem.palmaresProfiles)
        : normalizePalmaresProfiles(designItem);

      return {
        ...designItem,
        key: 'main',
        heroMedia: media,
        heroMediaMobile: cleanItem.heroMediaMobile || designItem.heroMediaMobile || '',
        heroMediaDesktop: cleanItem.heroMediaDesktop || designItem.heroMediaDesktop || '',
        heroMediaType: cleanItem.heroMediaType || (isVideo ? 'video' : 'image'),
        heroMediaMobileType: cleanItem.heroMediaMobileType || designItem.heroMediaMobileType || '',
        siteLogo: cleanItem.siteLogo || designItem.siteLogo || '',
        ctaSectionPhoto: cleanItem.ctaSectionPhoto || designItem.ctaSectionPhoto || '',
        instagramUrl: cleanItem.instagramUrl || designItem.instagramUrl || '',
        facebookUrl: cleanItem.facebookUrl || designItem.facebookUrl || '',
        youtubeUrl: cleanItem.youtubeUrl || designItem.youtubeUrl || '',
        whatsappUrl: cleanItem.whatsappUrl || designItem.whatsappUrl || '',
        palmaresProfiles,
        palmaresCards: createLegacyPalmaresCards(palmaresProfiles),
      };
    }

    if (activeTab === 'schedule') {
      return {
        ...cleanItem,
        type: cleanItem.type || '',
        trainerColor: '',
      };
    }

    if (activeTab === 'fight-galas') {
      return {
        ...cleanItem,
        order: Number(cleanItem.order || 0),
      };
    }

    if (activeTab === 'gallery') {
      return {
        url: cleanItem.url || '',
        type: cleanItem.type || 'image',
      };
    }

    if (activeTab === 'competitions') {
      const coachIds = Array.isArray(cleanItem.coachIds)
        ? cleanItem.coachIds
        : parseLines(cleanItem.coachIds);
      const coaches = coachOptions
        .filter(coach => coachIds.includes(coach._id || coach.id))
        .map(coach => ({ id: coach._id || coach.id, name: coach.name }));

      return {
        ...cleanItem,
        coachIds,
        coaches,
      };
    }

    return cleanItem;
  };

  const handleEdit = (item: any) => {
    if (activeTab === 'design') {
      setEditingItem({
        ...buildDesignItem(item),
        designSection: 'hero',
      });
      return;
    }

    const selectedCoach = coachOptions.find(coach => (coach._id || coach.id) === item.trainerId);

    if (activeTab === 'coaches') {
      setEditingItem(buildCoachEditingItem(item));
      return;
    }

    setEditingItem({
      ...item,
      id: item.id || createSlug(item.name || ''),
      title: item.title || item.group || '',
      trainer: item.trainer || selectedCoach?.name || '',
      role: item.role || selectedCoach?.role || '',
      image: item.image || selectedCoach?.image || '',
      coachIds: Array.isArray(item.coachIds)
        ? item.coachIds
        : Array.isArray(item.coaches)
          ? item.coaches.map((coach: any) => coach.id)
          : [],
      details: Array.isArray(item.details)
        ? item.details.join('\n')
        : Array.isArray(item.features)
          ? item.features.join('\n')
          : item.details || '',
    });
  };

  const handlePalmaresEdit = (profileIndex: number) => {
    const designItem = buildDesignItem(items[0] || {});
    const profile = designItem.palmaresProfiles[profileIndex] || defaultPalmaresProfiles[profileIndex] || defaultPalmaresProfiles[0];

    setEditingItem({
      ...designItem,
      designSection: 'palmares',
      _designId: designItem._id,
      profileIndex,
      name: profile.name,
      title: profile.title,
      record: profile.record,
      biography: profile.biography,
      highlight: profile.highlight,
      matches: profile.matches,
      wins: profile.wins,
      kos: profile.kos,
      importantGalas: profile.importantGalas.join('\n'),
      tournaments: profile.tournaments.join('\n'),
      awards: profile.awards.join('\n'),
    });
  };

  const handleLocationConfigEdit = (locationItem: any = {}) => {
    setEditingItem({
      ...locationItem,
      designSection: 'location-config',
    });
  };

  const handleLogoEdit = () => {
    const designItem = buildDesignItem(items[0] || {});
    setEditingItem({
      ...designItem,
      designSection: 'logo',
    });
  };

  const handleCtaPhotoEdit = () => {
    const designItem = buildDesignItem(items[0] || {});
    setEditingItem({
      ...designItem,
      designSection: 'cta-photo',
    });
  };

  const handleSocialLinksEdit = () => {
    const designItem = buildDesignItem(items[0] || {});
    setEditingItem({
      ...designItem,
      designSection: 'socials',
    });
  };

  const handleLocationConfigDelete = async (id: string) => {
    if (!window.confirm('Esti sigur ca vrei sa stergi aceasta locatie?')) return;
    try {
      await api.deleteItem('location-configs', id);
      loadData();
    } catch (error) {
      alert('Stergerea locatiei a esuat.');
    }
  };

  const handleReviewStatusChange = async (id: string, status: 'approved' | 'disabled') => {
    try {
      await api.updateItem('reviews', id, { status });
      setItems((currentItems) => currentItems.map((item) => (
        item._id === id ? { ...item, status } : item
      )));
    } catch (error) {
      alert('Statusul recenziei nu a putut fi actualizat.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        activeTab === 'gallery' &&
        !editingItem?._id &&
        Array.isArray(editingItem.galleryUrls) &&
        editingItem.galleryUrls.length > 0
      ) {
        await Promise.all(
          editingItem.galleryUrls.map((url: string) => api.addItem('gallery', { url, type: 'image' }))
        );
        setEditingItem(null);
        loadData();
        return;
      }

      const itemToSave = prepareItemForSave(editingItem);
      const adminTab = activeTab === 'design' && editingItem?.designSection === 'location-config'
        ? 'location-configs'
        : activeTab === 'config'
          ? 'location-configs'
          : activeTab;
      const itemId = editingItem._id || editingItem._designId;

      if (itemId) {
        await api.updateItem(adminTab, itemId, itemToSave);
      } else {
        await api.addItem(adminTab, itemToSave);
      }

      setEditingItem(null);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Salvarea a esuat.');
    }
  };

  const handleGalleryBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    try {
      const uploads = await api.uploadImages(files);
      const urls = uploads.map((upload: any) => upload.url).filter(Boolean);

      setEditingItem((current: any) => {
        const previousUrls = Array.isArray(current?.galleryUrls) ? current.galleryUrls : [];
        const mergedUrls = [...previousUrls, ...urls];

        return {
          ...current,
          url: current?.url || mergedUrls[0] || '',
          galleryUrls: mergedUrls,
        };
      });
    } catch (error) {
      alert('Upload-ul multiplu a esuat');
    } finally {
      e.target.value = '';
    }
  };

  const renderFormFields = () => {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
        const { url } = await api.uploadImage(file);
        setEditingItem({ ...editingItem, [field]: url });
      } catch (error) {
        alert('Upload eșuat');
      }
    };

    const ImageField = ({ label, field }: { label: string, field: string }) => (
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
        <div className="flex gap-4">
          <input 
            type="text"
            placeholder="URL Imagine" 
            className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-sm"
            value={editingItem[field] || ''}
            onChange={e => setEditingItem({...editingItem, [field]: e.target.value})}
          />
          <label className="cursor-pointer bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-accent transition-all flex items-center justify-center">
            <input type="file" className="hidden" onChange={e => handleFileUpload(e, field)} />
            <ImageIcon size={20} />
          </label>
        </div>
        {editingItem[field] && (
          <img src={getAssetUrl(editingItem[field])} alt="Preview" className="h-20 rounded-lg border border-white/10" />
        )}
      </div>
    );

    const HeroMediaField = ({
      title,
      field,
      typeField,
      aspectClass,
      ratioLabel,
      helperText,
    }: {
      title: string;
      field: string;
      typeField: string;
      aspectClass: string;
      ratioLabel: string;
      helperText: string;
    }) => {
      const mediaUrl = getAssetUrl(editingItem[field]);
      const mediaType = editingItem[typeField] || '';
      const showVideo = isVideoAsset(editingItem[field], mediaType);

      return (
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">{title}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/35">{ratioLabel}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
              {mediaType || 'auto detect'}
            </span>
          </div>

          <div className={`overflow-hidden rounded-3xl border border-white/10 bg-black/50 ${aspectClass}`}>
            {mediaUrl ? (
              showVideo ? (
                <video
                  src={mediaUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#111_0%,#050505_50%,#1e0606_100%)] text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
                Preview {ratioLabel}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="URL imagine sau video"
                className="flex-1 rounded-xl border border-white/10 bg-black p-4 text-sm"
                value={editingItem[field] || ''}
                onChange={e => setEditingItem({ ...editingItem, [field]: e.target.value })}
              />
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 hover:bg-accent transition-all">
                <input type="file" className="hidden" onChange={e => handleFileUpload(e, field)} />
                <ImageIcon size={20} />
              </label>
            </div>

            <select
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white [color-scheme:dark]"
              value={editingItem[typeField] || ''}
              onChange={e => setEditingItem({ ...editingItem, [typeField]: e.target.value })}
            >
              <option className="bg-black text-white" value="">Auto detect</option>
              <option className="bg-black text-white" value="image">Imagine</option>
              <option className="bg-black text-white" value="video">Video</option>
            </select>
          </div>

          <p className="text-xs leading-relaxed text-white/40">{helperText}</p>
        </div>
      );
    };

    if (activeTab === 'design') {
      return editingItem?.designSection === 'palmares' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              Profil palmares
            </p>
            <p className="mt-2 text-sm text-white/60">
              Editezi profilul pentru {editingItem?.name || 'sportiv'}.
            </p>
          </div>
          <input
            placeholder="Nume sportiv"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.name || ''}
            onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
          />
          <input
            placeholder="Subtitlu (ex: Multiplu Campion Mondial)"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.title || ''}
            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
          />
          <input
            placeholder="Titlu mare card (ex: 10+ titluri mondiale)"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.record || ''}
            onChange={e => setEditingItem({ ...editingItem, record: e.target.value })}
          />
          <textarea
            placeholder="Bibliografie scurta / descriere"
            className="w-full min-h-[130px] bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.biography || ''}
            onChange={e => setEditingItem({ ...editingItem, biography: e.target.value })}
          />
          <input
            placeholder="Badge scurt (ex: Superkombat / Glory / K-1)"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.highlight || ''}
            onChange={e => setEditingItem({ ...editingItem, highlight: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              placeholder="Nr. meciuri"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.matches || ''}
              onChange={e => setEditingItem({ ...editingItem, matches: e.target.value })}
            />
            <input
              placeholder="Nr. castigate"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.wins || ''}
              onChange={e => setEditingItem({ ...editingItem, wins: e.target.value })}
            />
            <input
              placeholder="Nr. KO"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.kos || ''}
              onChange={e => setEditingItem({ ...editingItem, kos: e.target.value })}
            />
          </div>
          <textarea
            placeholder={"Gale importante, cate una pe linie\nSuperkombat\nGlory\nK-1"}
            className="w-full min-h-[110px] bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.importantGalas || ''}
            onChange={e => setEditingItem({ ...editingItem, importantGalas: e.target.value })}
          />
          <textarea
            placeholder={"Turnee, cate unul pe linie\nPyramid Tournament\nWorld Grand Prix"}
            className="w-full min-h-[110px] bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.tournaments || ''}
            onChange={e => setEditingItem({ ...editingItem, tournaments: e.target.value })}
          />
          <textarea
            placeholder={"Premii, cate unul pe linie\nCampion mondial\nBest KO of the Night"}
            className="w-full min-h-[110px] bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.awards || ''}
            onChange={e => setEditingItem({ ...editingItem, awards: e.target.value })}
          />
        </div>
      ) : editingItem?.designSection === 'location-config' ? (
        <div className="space-y-4">
          <input
            placeholder="Nume locatie"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.name || ''}
            onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
          />
          <input
            placeholder="Adresa completa"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.address || ''}
            onChange={e => setEditingItem({ ...editingItem, address: e.target.value })}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Link Waze"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.wazeUrl || ''}
              onChange={e => setEditingItem({ ...editingItem, wazeUrl: e.target.value })}
            />
            <input
              placeholder="Link Google Maps"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.googleMapsUrl || ''}
              onChange={e => setEditingItem({ ...editingItem, googleMapsUrl: e.target.value })}
            />
          </div>
          <ImageField label="Imagine locatie" field="image" />
        </div>
      ) : editingItem?.designSection === 'logo' ? (
        <div className="space-y-4">
          <ImageField label="Logo site" field="siteLogo" />
          <p className="text-xs text-white/35 leading-relaxed">
            Incarca logo-ul care va fi folosit in navbar. Daca nu setezi nimic, ramane logoul text existent.
          </p>
        </div>
      ) : editingItem?.designSection === 'cta-photo' ? (
        <div className="space-y-4">
          <ImageField label="Poza sectiune finala" field="ctaSectionPhoto" />
          <p className="text-xs text-white/35 leading-relaxed">
            Incarca fotografia care va fi folosita in sectiunea finala "Gata sa incepi". Daca nu setezi nimic, ramane imaginea actuala.
          </p>
        </div>
      ) : editingItem?.designSection === 'socials' ? (
        <div className="space-y-4">
          <input
            placeholder="Link Instagram"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.instagramUrl || ''}
            onChange={e => setEditingItem({ ...editingItem, instagramUrl: e.target.value })}
          />
          <input
            placeholder="Link Facebook"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.facebookUrl || ''}
            onChange={e => setEditingItem({ ...editingItem, facebookUrl: e.target.value })}
          />
          <input
            placeholder="Link YouTube"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.youtubeUrl || ''}
            onChange={e => setEditingItem({ ...editingItem, youtubeUrl: e.target.value })}
          />
          <input
            placeholder="Link WhatsApp"
            className="w-full bg-black border border-white/10 p-4 rounded-xl"
            value={editingItem.whatsappUrl || ''}
            onChange={e => setEditingItem({ ...editingItem, whatsappUrl: e.target.value })}
          />
          <p className="text-xs text-white/35 leading-relaxed">
            Linkurile de aici vor fi folosite pentru iconitele sociale din footer.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
            <HeroMediaField
              title="Hero Desktop"
              field="heroMedia"
              typeField="heroMediaType"
              aspectClass="aspect-video min-h-[240px]"
              ratioLabel="16:9"
              helperText="Incarca media pentru ecrane mari. Poate fi imagine sau video."
            />
            <HeroMediaField
              title="Hero Mobil"
              field="heroMediaMobile"
              typeField="heroMediaMobileType"
              aspectClass="mx-auto aspect-[9/16] min-h-[320px] max-w-[230px]"
              ratioLabel="9:16"
              helperText="Incarca media dedicata pentru telefon. Daca lipseste, site-ul foloseste varianta desktop."
            />
          </div>
          <p className="text-xs text-white/35 leading-relaxed">
            Editorul Hero are acum upload si preview separat pentru fiecare format, direct in modal.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'martial-arts':
        return (
          <div className="space-y-4">
            <input 
              placeholder="Titlu (ex: Kickboxing)" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.title || ''}
              onChange={e => setEditingItem({...editingItem, title: e.target.value})}
            />
            <textarea 
              placeholder="Descriere" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[100px]"
              value={editingItem.description || ''}
              onChange={e => setEditingItem({...editingItem, description: e.target.value})}
            />
            <ImageField label="Poză Disciplină" field="image" />
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select 
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.location || ''}
                onChange={e => setEditingItem({...editingItem, location: e.target.value})}
              >
                <option value="">Locație</option>
                {(locationConfigOptions.length > 0 ? locationConfigOptions : [{ name: 'Ghencea' }, { name: 'Militari' }]).map((location: any) => (
                  <option key={location._id || location.name} value={location.name}>{location.name}</option>
                ))}
              </select>
              <select 
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.day || ''}
                onChange={e => setEditingItem({...editingItem, day: e.target.value})}
              >
                <option value="">Ziua</option>
                {['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <input 
              placeholder="Iinterval Orar (ex: 18:00 - 19:30)" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.time || ''}
              onChange={e => setEditingItem({...editingItem, time: e.target.value})}
            />
            <input 
              placeholder="Disciplina (ex: Kickboxing Adulți)" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.title || ''}
              onChange={e => setEditingItem({...editingItem, title: e.target.value})}
            />
	            <input
	              placeholder="Tag / tip afisat (ex: Kickboxing, Grupa Avansati, Kids)"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl"
	              value={editingItem.type || ''}
	              onChange={e => setEditingItem({...editingItem, type: e.target.value})}
	            />
		            <div>
	              <select
	                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white [color-scheme:dark]"
	                value={editingItem.trainerId || ''}
	                onChange={e => {
	                  const coach = coachOptions.find(item => (item._id || item.id) === e.target.value);
	                  setEditingItem({
	                    ...editingItem,
	                    trainerId: e.target.value,
	                    trainer: coach?.name || '',
	                  });
	                }}
	              >
	                <option className="bg-black text-white" value="">Alege antrenor</option>
	                {coachOptions.map(coach => (
	                  <option className="bg-black text-white" key={coach._id || coach.id} value={coach._id || coach.id}>{coach.name}</option>
	                ))}
	              </select>
		            </div>
	            <input
	              placeholder="Nume Antrenor afisat"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl"
	              value={editingItem.trainer || ''}
	              onChange={e => setEditingItem({...editingItem, trainer: e.target.value})}
	            />
          </div>
        );
      case 'config':
        return (
          <div className="space-y-4">
            <input
              placeholder="Nume locatie (ex: Militari)"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.name || ''}
              onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
            />
            <input
              placeholder="Adresa completa"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.address || ''}
              onChange={e => setEditingItem({ ...editingItem, address: e.target.value })}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Link Waze"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.wazeUrl || ''}
                onChange={e => setEditingItem({ ...editingItem, wazeUrl: e.target.value })}
              />
              <input
                placeholder="Link Google Maps"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.googleMapsUrl || ''}
                onChange={e => setEditingItem({ ...editingItem, googleMapsUrl: e.target.value })}
              />
            </div>
            <ImageField label="Imagine locatie" field="image" />
          </div>
        );
      case 'coaches': {
        const coachLocations = Array.isArray(editingItem.locations) ? editingItem.locations : [];
        const coachSessions = Array.isArray(editingItem.trainingSchedule) ? editingItem.trainingSchedule : [];
        const availableLocationOptions = coachLocations
          .map((location: any) => String(location?.name || '').trim())
          .filter(Boolean);

        return (
          <div className="space-y-4">
            <input
              placeholder="ID profil / slug (ex: bogdan-stoica)"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.id || ''}
              onChange={e => setEditingItem({...editingItem, id: createSlug(e.target.value)})}
            />
            <input 
              placeholder="Nume Antrenor" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.name || ''}
              onChange={e => {
                const previousGeneratedId = createSlug(editingItem.name || '');
                const shouldSyncId = !editingItem.id || editingItem.id === previousGeneratedId;

                setEditingItem({
                  ...editingItem,
                  name: e.target.value,
                  id: shouldSyncId ? createSlug(e.target.value) : editingItem.id,
                });
              }}
            />
            <input 
              placeholder="Rol (ex: Head Coach)" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.role || ''}
              onChange={e => setEditingItem({...editingItem, role: e.target.value})}
            />
            <ImageField label="Poză Antrenor" field="image" />
            <input
              placeholder="Eticheta card Subscriptii (ex: Kickbox / Box / MMA)"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.subscriptionTag || ''}
              onChange={e => setEditingItem({...editingItem, subscriptionTag: e.target.value})}
            />
            <textarea 
              placeholder="Bio (ex: Legenda kickboxing-ului romanesc...)"
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[100px]"
              value={editingItem.bio || editingItem.description || ''}
              onChange={e => setEditingItem({...editingItem, bio: e.target.value, description: e.target.value})}
            />
            <input
              placeholder="Pret baza (ex: 300 RON / Sedinta)"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.basePrice || ''}
              onChange={e => setEditingItem({...editingItem, basePrice: e.target.value})}
            />
            <textarea
              placeholder={"Specializari, cate una pe linie\nKickboxing Elite\nSparring\nConditioning"}
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[120px]"
              value={Array.isArray(editingItem.specialties) ? editingItem.specialties.join('\n') : (editingItem.specialties || editingItem.specializations || '')}
              onChange={e => setEditingItem({...editingItem, specialties: e.target.value})}
            />
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Locatii</p>
                  <p className="mt-1 text-xs text-white/35">Completeaza fiecare locatie separat, cu nume, adresa si program general.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addCoachCollectionItem('locations', () => ({ configId: '', name: '', address: '', schedule: '' }))}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:border-accent hover:text-accent"
                >
                  <Plus size={12} /> Adauga locatie
                </button>
              </div>

              {coachLocations.length > 0 ? (
                <div className="space-y-3">
                  {coachLocations.map((location: any, index: number) => (
                    <div key={`coach-location-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Locatia {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeCoachCollectionItem('locations', index)}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/55 hover:border-red-500 hover:text-red-400"
                        >
                          <Trash2 size={12} /> Sterge
                        </button>
                      </div>

                      <div className="grid gap-3">
                        <label className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Locatie din Config</span>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-black p-4 text-white [color-scheme:dark]"
                            value={location.configId || location.name || ''}
                            onChange={e => {
                              const selectedLocation = getLocationConfigMatch(e.target.value);
                              setEditingItem((current: any) => {
                                const currentLocations = Array.isArray(current?.locations) ? current.locations : [];
                                return {
                                  ...current,
                                  locations: currentLocations.map((entry: any, entryIndex: number) => (
                                    entryIndex === index
                                      ? {
                                          ...entry,
                                          configId: selectedLocation?._id || '',
                                          name: selectedLocation?.name || '',
                                          address: selectedLocation?.address || '',
                                        }
                                      : entry
                                  )),
                                };
                              });
                            }}
                          >
                            <option className="bg-black text-white" value="">
                              {locationConfigOptions.length > 0 ? 'Alege locatie' : 'Adauga intai locatii in Config'}
                            </option>
                            {locationConfigOptions.map((configLocation: any) => (
                              <option
                                key={configLocation._id || configLocation.name}
                                className="bg-black text-white"
                                value={configLocation._id || configLocation.name}
                              >
                                {configLocation.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Adresa preluata din Config</span>
                          <div className="rounded-xl border border-white/10 bg-black px-4 py-4 text-sm text-white/65">
                            {location.address || 'Selecteaza o locatie din Config pentru a prelua adresa.'}
                          </div>
                        </div>
                        <label className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Program locatie pentru acest antrenor</span>
                          <input
                            className="w-full rounded-xl border border-white/10 bg-black p-4"
                            placeholder="Ex: Luni - Sambata 08:00 - 22:00"
                            value={location.schedule || ''}
                            onChange={e => updateCoachCollectionItem('locations', index, 'schedule', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/30">
                  Adauga prima locatie ca sa o poti selecta apoi in programul antrenorului.
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Program antrenamente</p>
                  <p className="mt-1 text-xs text-white/35">Pentru fiecare rand completeaza ora, alege locatia si scrie tipul sedintei.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addCoachCollectionItem('trainingSchedule', () => ({ time: '', location: '', title: '' }))}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:border-accent hover:text-accent"
                >
                  <Plus size={12} /> Adauga program
                </button>
              </div>

              {coachSessions.length > 0 ? (
                <div className="space-y-3">
                  {coachSessions.map((session: any, index: number) => (
                    <div key={`coach-session-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Program {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeCoachCollectionItem('trainingSchedule', index)}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/55 hover:border-red-500 hover:text-red-400"
                        >
                          <Trash2 size={12} /> Sterge
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Ora / interval</span>
                          <input
                            className="w-full rounded-xl border border-white/10 bg-black p-4"
                            placeholder="Ex: 19:30 - 20:30"
                            value={session.time || ''}
                            onChange={e => updateCoachCollectionItem('trainingSchedule', index, 'time', e.target.value)}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Locatia</span>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-black p-4 text-white [color-scheme:dark]"
                            value={session.location || ''}
                            onChange={e => updateCoachCollectionItem('trainingSchedule', index, 'location', e.target.value)}
                            disabled={availableLocationOptions.length === 0}
                          >
                            <option className="bg-black text-white" value="">
                              {availableLocationOptions.length > 0 ? 'Alege locatia' : 'Adauga mai intai o locatie'}
                            </option>
                            {availableLocationOptions.map((locationName: string) => (
                              <option key={`${locationName}-${index}`} className="bg-black text-white" value={locationName}>
                                {locationName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Tip sedinta</span>
                          <input
                            className="w-full rounded-xl border border-white/10 bg-black p-4"
                            placeholder="Ex: Kickboxing grupa"
                            value={session.title || ''}
                            onChange={e => updateCoachCollectionItem('trainingSchedule', index, 'title', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/30">
                  Adauga intervalele de program pentru a genera corect cardul de subscriptii.
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Pret Privat 1:1 (ex: 250 RON / Sedinta)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.privatePrice || ''}
                onChange={e => setEditingItem({...editingItem, privatePrice: e.target.value})}
              />
              <input
                placeholder="Pret Grupa (ex: 450 RON / Luna)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.groupPrice || ''}
                onChange={e => setEditingItem({...editingItem, groupPrice: e.target.value})}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Locatie grupa (ex: Ghencea & Militari)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.groupLocation || ''}
                onChange={e => setEditingItem({...editingItem, groupLocation: e.target.value})}
              />
              <input
                placeholder="Program grupa (ex: Luni, Miercuri @ 19:30)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.groupSchedule || ''}
                onChange={e => setEditingItem({...editingItem, groupSchedule: e.target.value})}
              />
            </div>
            <textarea
              placeholder={"Detalii Privat 1:1, cate unul pe linie\nAtentie exclusiva\nAnaliza tehnica\nPlan personalizat"}
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[110px]"
              value={Array.isArray(editingItem.privateDetails) ? editingItem.privateDetails.join('\n') : (editingItem.privateDetails || '')}
              onChange={e => setEditingItem({...editingItem, privateDetails: e.target.value})}
            />
            <textarea
              placeholder={"Detalii Grupa, cate unul pe linie\nTehnica de lupta\nSparring controlat\nAcces zona forta"}
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[110px]"
              value={Array.isArray(editingItem.groupDetails) ? editingItem.groupDetails.join('\n') : (editingItem.groupDetails || '')}
              onChange={e => setEditingItem({...editingItem, groupDetails: e.target.value})}
            />
          </div>
        );
      }
	      case 'subscriptions':
	        return (
	          <div className="space-y-4">
            <select
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.trainerId || ''}
              onChange={e => {
                const coach = coachOptions.find(item => (item._id || item.id) === e.target.value);
                setEditingItem({
                  ...editingItem,
                  trainerId: e.target.value,
                  trainer: coach?.name || editingItem.trainer || '',
                  role: coach?.role || editingItem.role || '',
                  image: editingItem.image || coach?.image || '',
                });
              }}
            >
              <option value="">Alege antrenor / profil</option>
              {coachOptions.map(coach => (
                <option key={coach._id || coach.id} value={coach._id || coach.id}>{coach.name}</option>
              ))}
            </select>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Nume afisat antrenor (ex: Bogdan Stoica)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.trainer || coachOptions.find(coach => (coach._id || coach.id) === editingItem.trainerId)?.name || ''}
                onChange={e => setEditingItem({...editingItem, trainer: e.target.value})}
              />
              <input
                placeholder="Rol antrenor (ex: Multiplu Campion Mondial)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.role || coachOptions.find(coach => (coach._id || coach.id) === editingItem.trainerId)?.role || ''}
                onChange={e => setEditingItem({...editingItem, role: e.target.value})}
              />
            </div>
            <ImageField label="Poza Card / Antrenor" field="image" />
            <input 
              placeholder="Nume Abonament" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.title || ''}
              onChange={e => setEditingItem({...editingItem, title: e.target.value})}
            />
            <input 
              placeholder="Preț (ex: 250 RON)" 
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.price || ''}
              onChange={e => setEditingItem({...editingItem, price: e.target.value})}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Categorie badge (ex: Avansati / Pro)"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.category || ''}
                onChange={e => setEditingItem({...editingItem, category: e.target.value})}
              />
              <select
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.location || ''}
                onChange={e => setEditingItem({...editingItem, location: e.target.value})}
              >
                <option value="">Locatie</option>
                <option value="Ghencea">Ghencea</option>
                <option value="Militari">Militari</option>
                <option value="Ghencea & Militari">Ghencea & Militari</option>
              </select>
            </div>
            <input
              placeholder="Program (ex: Luni, Miercuri, Vineri @ 19:30)"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.schedule || ''}
              onChange={e => setEditingItem({...editingItem, schedule: e.target.value})}
            />
            <textarea
              placeholder={"Beneficii card, cate unul pe linie\nTehnica de lupta avansata\nSparring controlat\nStrategie ring\nAcces zona Forta"}
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[140px]"
              value={Array.isArray(editingItem.details) ? editingItem.details.join('\n') : (editingItem.details || '')}
              onChange={e => setEditingItem({...editingItem, details: e.target.value})}
            />
	          </div>
	        );
	      case 'fight-galas':
	        return (
	          <div className="space-y-4">
	            <ImageField label="Sigla gala / organizatie" field="logo" />
	            <input
	              placeholder="Nume gala (ex: Glory Kickboxing)"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl"
	              value={editingItem.name || ''}
	              onChange={e => setEditingItem({...editingItem, name: e.target.value})}
	            />
	            <input
	              placeholder="Luptatori (ex: Bogdan Stoica vs. Alex Pereira)"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl"
	              value={editingItem.fighters || ''}
	              onChange={e => setEditingItem({...editingItem, fighters: e.target.value})}
	            />
	            <div className="grid md:grid-cols-2 gap-4">
	              <input
	                placeholder="Locatie / tara (ex: International)"
	                className="w-full bg-black border border-white/10 p-4 rounded-xl"
	                value={editingItem.location || ''}
	                onChange={e => setEditingItem({...editingItem, location: e.target.value})}
	              />
	              <input
	                placeholder="Ani / perioada (ex: 2014 - 2018)"
	                className="w-full bg-black border border-white/10 p-4 rounded-xl"
	                value={editingItem.years || ''}
	                onChange={e => setEditingItem({...editingItem, years: e.target.value})}
	              />
	            </div>
	            <input
	              placeholder="Badge scurt (ex: Main Event / World Title)"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl"
	              value={editingItem.highlight || ''}
	              onChange={e => setEditingItem({...editingItem, highlight: e.target.value})}
	            />
	            <textarea
	              placeholder="Descriere scurta despre prezenta in gala"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[110px]"
	              value={editingItem.description || ''}
	              onChange={e => setEditingItem({...editingItem, description: e.target.value})}
	            />
	            <input
	              placeholder="Video YouTube URL (ex: https://www.youtube.com/watch?v=...)"
	              className="w-full bg-black border border-white/10 p-4 rounded-xl"
	              value={editingItem.youtubeUrl || ''}
	              onChange={e => setEditingItem({...editingItem, youtubeUrl: e.target.value})}
	            />
	            <div className="grid md:grid-cols-2 gap-4">
	              <input
	                placeholder="Website / link optional"
	                className="w-full bg-black border border-white/10 p-4 rounded-xl"
	                value={editingItem.website || ''}
	                onChange={e => setEditingItem({...editingItem, website: e.target.value})}
	              />
	              <input
	                type="number"
	                placeholder="Ordine afisare (ex: 1)"
	                className="w-full bg-black border border-white/10 p-4 rounded-xl"
	                value={editingItem.order || ''}
	                onChange={e => setEditingItem({...editingItem, order: e.target.value})}
	              />
	            </div>
	          </div>
	        );
	      case 'competitions':
	        return (
          <div className="space-y-4">
            <ImageField label="Imagine / Poster Competitie" field="image" />
            <input
              placeholder="Nume competitie"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.name || ''}
              onChange={e => setEditingItem({...editingItem, name: e.target.value})}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Locatie"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.location || ''}
                onChange={e => setEditingItem({...editingItem, location: e.target.value})}
              />
              <input
                type="date"
                className="w-full bg-black border border-white/10 p-4 rounded-xl"
                value={editingItem.date || ''}
                onChange={e => setEditingItem({...editingItem, date: e.target.value})}
              />
            </div>
            <input
              placeholder="Parola de inscriere"
              className="w-full bg-black border border-white/10 p-4 rounded-xl"
              value={editingItem.password || ''}
              onChange={e => setEditingItem({...editingItem, password: e.target.value})}
            />
            <textarea
              placeholder="Detalii competitie"
              className="w-full bg-black border border-white/10 p-4 rounded-xl min-h-[110px]"
              value={editingItem.details || ''}
              onChange={e => setEditingItem({...editingItem, details: e.target.value})}
            />
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Antrenori participanti</label>
              <div className="grid md:grid-cols-2 gap-2">
                {coachOptions.map(coach => {
                  const id = coach._id || coach.id;
                  const selected = (editingItem.coachIds || []).includes(id);

                  return (
                    <label key={id} className={`flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer transition-all ${selected ? 'border-accent bg-accent/10 text-white' : 'border-white/10 bg-black text-white/50'}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={event => {
                          const current = editingItem.coachIds || [];
                          setEditingItem({
                            ...editingItem,
                            coachIds: event.target.checked
                              ? [...current, id]
                              : current.filter((item: string) => item !== id),
                          });
                        }}
                      />
                      {coach.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-4">
            <ImageField label="Încarcă Poză Galerie" field="url" />
          </div>
        );
	      case 'design':
	        return (
	          <div className="space-y-4">
	            <div className="grid gap-4 md:grid-cols-2">
	              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
	                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Hero Desktop</p>
	                <ImageField label="Media Hero desktop" field="heroMedia" />
	                <select
	                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-white [color-scheme:dark]"
	                  value={editingItem.heroMediaType || ''}
	                  onChange={e => setEditingItem({...editingItem, heroMediaType: e.target.value})}
	                >
	                  <option className="bg-black text-white" value="">Auto detect</option>
	                  <option className="bg-black text-white" value="image">Imagine</option>
	                  <option className="bg-black text-white" value="video">Video</option>
	                </select>
	              </div>
	              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
	                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Hero Mobil</p>
	                <ImageField label="Media Hero mobil" field="heroMediaMobile" />
	                <select
	                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-white [color-scheme:dark]"
	                  value={editingItem.heroMediaMobileType || ''}
	                  onChange={e => setEditingItem({...editingItem, heroMediaMobileType: e.target.value})}
	                >
	                  <option className="bg-black text-white" value="">Auto detect</option>
	                  <option className="bg-black text-white" value="image">Imagine</option>
	                  <option className="bg-black text-white" value="video">Video</option>
	                </select>
	              </div>
	            </div>
	            <p className="text-xs text-white/35 leading-relaxed">
	              Ai acum doua sectiuni separate: una pentru Hero desktop si una pentru Hero mobil. Fiecare poate avea independent imagine sau video.
	            </p>
	            <div className="space-y-2">
	              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
	                Carduri palmares Bogdan / Andrei
	              </label>
	              <textarea
	                className="w-full min-h-[170px] bg-black border border-white/10 p-4 rounded-xl text-white text-sm leading-relaxed placeholder:text-white/20"
	                value={editingItem.palmaresCardsText || ''}
	                onChange={e => setEditingItem({ ...editingItem, palmaresCardsText: e.target.value })}
	                placeholder={`Bogdan Stoica | Multiplu Campion Mondial | 10+ titluri mondiale | Unul dintre cei mai spectaculoși luptători români, prezent în gale internaționale majore. | Superkombat / Glory / K-1\nAndrei Stoica | Campion mondial kickboxing | 20+ victorii prin KO | Forță, disciplină și experiență de main event aduse direct în sală. | Main Event / World Title / Heavy Hits`}
	              />
	              <p className="text-xs text-white/35 leading-relaxed">
	                Scrie cate un card pe linie, in formatul: Nume | Subtitlu | Palmares mare | Descriere | Badge. Primele doua linii apar in pagina.
	              </p>
	            </div>
	          </div>
	        );
	      default: return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-10 rounded-3xl w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-display font-black text-white text-center mb-6 uppercase tracking-tighter">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-accent outline-none transition-all"
            />
            <button className="w-full bg-accent text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

	  const TABS = [
	    { id: 'design', label: 'Design', icon: MonitorPlay },
    { id: 'martial-arts', label: 'Arte Marțiale', icon: Dumbbell },
    { id: 'schedule', label: 'Program', icon: Calendar },
	    { id: 'coaches', label: 'Antrenori', icon: Users },
	    { id: 'fight-galas', label: 'Gale', icon: Award },
	    { id: 'competitions', label: 'Competitii', icon: Trophy },
    { id: 'registrations', label: 'Inscrieri', icon: ClipboardList },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'reviews', label: 'Recenzii', icon: MessageSquare },
    { id: 'requests', label: 'Solicitări', icon: Inbox },
  ];

  return (
	    <div className="h-screen overflow-hidden bg-black text-white">
	      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto border-r border-white/10 bg-black/95 p-6 lg:block">
	        <div className="mb-8">
	          <h1 className="text-3xl font-display font-black uppercase tracking-tighter">Admin Panel</h1>
	          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">Manage Academy Content</p>
	        </div>
	        <button
	          onClick={handleLogout}
	          className="mb-8 flex w-full items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all"
	        >
	          <LogOut size={16} /> Logout
	        </button>

	        <div className="space-y-2">
	            {TABS.map(tab => (
	              <button
	                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-sm font-bold uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-accent border-accent text-white' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                }`}
              >
                <tab.icon size={18} />
	                {tab.label}
	              </button>
	            ))}
	          </div>
	      </aside>

	      <div className="h-screen overflow-y-auto px-4 py-6 lg:ml-72 lg:px-8 lg:py-8">
	        <div className="mx-auto max-w-6xl">
	          <div className="mb-6 flex flex-col gap-4 lg:hidden">
	            <div>
	              <h1 className="text-3xl font-display font-black uppercase tracking-tighter">Admin Panel</h1>
	              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">Manage Academy Content</p>
	            </div>
	            <button
	              onClick={handleLogout}
	              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all"
	            >
	              <LogOut size={16} /> Logout
	            </button>
	            <div className="grid grid-cols-2 gap-2">
	              {TABS.map(tab => (
	                <button
	                  key={tab.id}
	                  onClick={() => setActiveTab(tab.id)}
	                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${
	                    activeTab === tab.id
	                      ? 'bg-accent border-accent text-white'
	                      : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
	                  }`}
	                >
	                  <tab.icon size={15} />
	                  {tab.label}
	                </button>
	              ))}
	            </div>
	          </div>

	          <div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-display font-black uppercase tracking-tighter">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h3>
                {activeTab !== 'requests' && activeTab !== 'registrations' && activeTab !== 'design' && activeTab !== 'reviews' && (
                  <button 
                    onClick={() => setEditingItem(activeTab === 'coaches' ? buildCoachEditingItem({}) : {})}
                    className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus size={14} /> Add New
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-20 text-center text-white/20 uppercase text-xs font-bold tracking-widest">Loading...</div>
	              ) : activeTab === 'design' ? (
                <div className="space-y-6">
	                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
	                    <div className="mb-5 border-b border-white/10 pb-5">
	                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">1. Imagine Hero</p>
	                    </div>
	                    <div className="grid items-start gap-3 lg:grid-cols-[0.72fr_1.28fr]">
	                      <div className="flex h-[304px] flex-col rounded-3xl border border-white/10 bg-black/30 p-5">
	                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Hero settings</p>
	                        <h4 className="mt-3 text-2xl font-display font-black uppercase tracking-tight text-white">Sectiunea principala</h4>
	                        <p className="mt-4 text-sm leading-relaxed text-white/55">
	                          Aici setezi doua versiuni independente pentru hero: una pentru desktop si una pentru mobil. Fiecare poate fi imagine sau video.
	                        </p>
	                        {/* <div className="mt-4 grid gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
	                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
	                            Mobil: {items[0]?.heroMediaMobile ? (items[0]?.heroMediaMobileType || 'auto detect') : 'neconfigurat'}
	                          </div>
	                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
	                            Desktop: {items[0]?.heroMedia ? (items[0]?.heroMediaType || 'auto detect') : 'neconfigurat'}
	                          </div>
	                        </div> */}
	                        <button
	                          onClick={() => handleEdit(items[0] || buildDesignItem({}))}
	                          className="mt-auto flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
	                        >
	                          <Settings size={14} /> Editeaza Hero
	                        </button>
	                      </div>
	                      <div className="grid items-start gap-3 lg:grid-cols-[0.62fr_1fr]">
	                        <div className="self-start overflow-hidden rounded-3xl border border-white/10 bg-black/40">
	                          <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-3 py-2.5">
	                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Mobile Preview</p>
	                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">9:16</span>
	                          </div>
	                          <div className="flex h-[250px] items-center justify-center p-2">
	                            <div className="h-full aspect-[9/16] overflow-hidden rounded-[24px] border border-white/10 bg-black/50">
	                              {items[0]?.heroMediaMobile ? (
	                                isVideoAsset(items[0]?.heroMediaMobile, items[0]?.heroMediaMobileType) ? (
	                                  <video
	                                    className="h-full w-full object-cover"
	                                    src={getAssetUrl(items[0]?.heroMediaMobile)}
	                                    muted
	                                    loop
	                                    playsInline
	                                    autoPlay
	                                  />
	                                ) : (
	                                  <img
	                                    src={getAssetUrl(items[0]?.heroMediaMobile)}
	                                    alt="Hero mobile preview"
	                                    className="h-full w-full object-cover"
	                                  />
	                                )
	                              ) : (
	                                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)] text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
	                                  Mobile hero
	                                </div>
	                              )}
	                            </div>
	                          </div>
	                        </div>
	                        <div className="self-start overflow-hidden rounded-3xl border border-white/10 bg-black/40">
	                          <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-3 py-2.5">
	                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Desktop Preview</p>
	                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">16:9</span>
	                          </div>
	                          <div className="h-[250px]">
	                            {items[0]?.heroMedia ? (
	                              isVideoAsset(items[0]?.heroMedia, items[0]?.heroMediaType) ? (
	                                <video
	                                  className="h-full w-full object-cover"
	                                  src={getAssetUrl(items[0]?.heroMedia)}
	                                  muted
	                                  loop
	                                  playsInline
	                                  autoPlay
	                                />
	                              ) : (
	                                <img
	                                  src={getAssetUrl(items[0]?.heroMedia)}
	                                  alt="Hero desktop preview"
	                                  className="h-full w-full object-cover"
	                                />
	                              )
	                            ) : (
	                              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)] text-sm font-bold uppercase tracking-[0.2em] text-white/25">
	                                Desktop hero
	                              </div>
	                            )}
	                          </div>
	                        </div>
	                      </div>
	                    </div>
	                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="mb-5 border-b border-white/10 pb-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">2. Palmares</p>
                      <h4 className="mt-2 text-2xl font-display font-black uppercase tracking-tight text-white">Cardurile Bogdan & Andrei</h4>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {normalizePalmaresProfiles(items[0] || {}).map((profile, idx) => (
                        <div key={profile.slug} className="rounded-3xl border border-white/10 bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">{profile.name}</p>
                              <h4 className="mt-2 text-2xl font-display font-black uppercase text-white">{profile.record || 'Palmares'}</h4>
                              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">{profile.title || 'Campion'}</p>
                            </div>
                            <button
                              onClick={() => handlePalmaresEdit(idx)}
                              className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white/70 transition-all hover:border-accent hover:text-accent"
                            >
                              <Settings size={16} />
                            </button>
                          </div>
                          <p className="mt-4 text-sm leading-relaxed text-white/55">{profile.biography || 'Adauga o biografie scurta din editor.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">3. Adresa</p>
                        <h4 className="mt-2 text-2xl font-display font-black uppercase tracking-tight text-white">Locatii & popup-uri</h4>
                      </div>
                      <button
                        onClick={() => handleLocationConfigEdit({})}
                        className="rounded-xl bg-accent px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        <Plus size={14} /> Adauga adresa
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {locationConfigOptions.length > 0 ? locationConfigOptions.map((item, idx) => (
                        <div key={item._id || idx} className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)]">
                          {item.image ? (
                            <img src={getAssetUrl(item.image)} alt={item.name || 'Locatie'} className="h-40 w-full object-cover" />
                          ) : (
                            <div className="h-40 w-full bg-black/40" />
                          )}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">{item.name || 'Locatie'}</p>
                                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.address || 'Adauga adresa completa.'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleLocationConfigEdit(item)} className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white/70 transition-all hover:border-accent hover:text-accent">
                                  <Settings size={14} />
                                </button>
                                <button onClick={() => handleLocationConfigDelete(item._id)} className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white/70 transition-all hover:border-red-500 hover:text-red-400">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center text-white/30">
                          Nu ai adaugat inca nicio adresa.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="mb-5 border-b border-white/10 pb-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">4. Setup Logo</p>
                      <h4 className="mt-2 text-2xl font-display font-black uppercase tracking-tight text-white">Logo site</h4>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                      <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-black/30 p-6">
                        {items[0]?.siteLogo ? (
                          <img src={getAssetUrl(items[0]?.siteLogo)} alt="Logo site" className="max-h-40 w-full object-contain" />
                        ) : (
                          <div className="text-center text-sm font-bold uppercase tracking-[0.2em] text-white/25">Logo preview</div>
                        )}
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                        <p className="text-sm leading-relaxed text-white/55">
                          Aici setezi logo-ul care va aparea in navbar. Daca nu adaugi o imagine, ramane varianta text existenta.
                        </p>
                        <button
                          onClick={handleLogoEdit}
                          className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                        >
                          <Settings size={14} /> Setup Logo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="mb-5 border-b border-white/10 pb-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">5. Section Photo</p>
                      <h4 className="mt-2 text-2xl font-display font-black uppercase tracking-tight text-white">Poza sectiune finala</h4>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                      <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                        {items[0]?.ctaSectionPhoto ? (
                          <img src={getAssetUrl(items[0]?.ctaSectionPhoto)} alt="Poza sectiune finala" className="h-full min-h-[220px] w-full object-cover" />
                        ) : (
                          <div className="text-center text-sm font-bold uppercase tracking-[0.2em] text-white/25">Section photo preview</div>
                        )}
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                        <p className="text-sm leading-relaxed text-white/55">
                          Aici incarci poza pentru sectiunea finala cu "Gata sa incepi". Imaginea se actualizeaza direct in frontend.
                        </p>
                        <button
                          onClick={handleCtaPhotoEdit}
                          className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                        >
                          <Settings size={14} /> Upload Section Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <div className="mb-5 border-b border-white/10 pb-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">6. Social Links</p>
                      <h4 className="mt-2 text-2xl font-display font-black uppercase tracking-tight text-white">Footer socials</h4>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                        <div className="space-y-3 text-sm text-white/55">
                          <p><span className="text-white/30">Instagram:</span> {items[0]?.instagramUrl || 'Neconfigurat'}</p>
                          <p><span className="text-white/30">Facebook:</span> {items[0]?.facebookUrl || 'Neconfigurat'}</p>
                          <p><span className="text-white/30">YouTube:</span> {items[0]?.youtubeUrl || 'Neconfigurat'}</p>
                          <p><span className="text-white/30">WhatsApp:</span> {items[0]?.whatsappUrl || 'Neconfigurat'}</p>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                        <p className="text-sm leading-relaxed text-white/55">
                          Aici setezi linkurile pentru iconitele sociale din footer: Instagram, Facebook, YouTube si WhatsApp.
                        </p>
                        <button
                          onClick={handleSocialLinksEdit}
                          className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                        >
                          <Settings size={14} /> Edit Social Links
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
	              ) : activeTab === 'config' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      Nu ai adaugat inca nicio locatie.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-muted/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                      >
                        <div className="absolute inset-0">
                          {item.image ? (
                            <img
                              src={getAssetUrl(item.image)}
                              alt={item.name || 'Locatie'}
                              className="h-full w-full object-cover opacity-45 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-60"
                            />
                          ) : (
                            <div className="h-full w-full bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                        </div>

                        <div className="relative flex min-h-[320px] flex-col justify-between p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                              0{idx + 1}
                            </span>
                            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-accent hover:text-accent"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-red-500 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                              Preview locatie
                            </p>
                            <h4 className="mt-3 text-2xl font-display font-black uppercase tracking-tight text-white">
                              {item.name || 'Locatie'}
                            </h4>
                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
                              {item.address || 'Adauga adresa completa din editor.'}
                            </p>
                          </div>

                          <div className="mt-5 space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {item.googleMapsUrl && (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                                  Google Maps
                                </span>
                              )}
                              {item.wazeUrl && (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                                  Waze
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                Popup locatie
                              </span>
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black"
                              >
                                Editeaza
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'martial-arts' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      No items found in this category.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-muted/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                      >
                        <div className="absolute inset-0">
                          {item.image ? (
                            <img
                              src={getAssetUrl(item.image)}
                              alt={item.title || 'Disciplina'}
                              className="h-full w-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-55"
                            />
                          ) : (
                            <div className="h-full w-full bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                        </div>

                        <div className="relative flex min-h-[250px] flex-col justify-between p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                              0{idx + 1}
                            </span>
                            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-accent hover:text-accent"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-red-500 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                              Preview disciplina
                            </p>
                            <h4 className="mt-3 text-2xl font-display font-black uppercase tracking-tight text-white">
                              {item.title || 'Disciplina'}
                            </h4>
                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
                              {item.description || 'Adauga o descriere din editor pentru a vedea preview-ul complet.'}
                            </p>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                              Card preview
                            </span>
                            <button
                              onClick={() => handleEdit(item)}
                              className="rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black"
                            >
                              Editeaza
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'subscriptions' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      No items found in this category.
                    </div>
                  ) : (
                    items.map((item, idx) => {
                      const detailItems = Array.isArray(item.details)
                        ? item.details
                        : String(item.details || '')
                            .split('\n')
                            .map((value: string) => value.trim())
                            .filter(Boolean);

                      return (
                        <div
                          key={item._id || idx}
                          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-muted/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                        >
                          <div className="absolute inset-0">
                            {item.image ? (
                              <img
                                src={getAssetUrl(item.image)}
                                alt={item.title || item.trainer || 'Abonament'}
                                className="h-full w-full object-cover object-top opacity-35 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-55"
                              />
                            ) : (
                              <div className="h-full w-full bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                          </div>

                          <div className="relative flex min-h-[320px] flex-col justify-between p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                                  0{idx + 1}
                                </span>
                                <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                                  {item.category || 'Program'}
                                </span>
                              </div>
                              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-accent hover:text-accent"
                                >
                                  <Settings size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-red-500 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-5">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                                Preview abonament
                              </p>
                              <h4 className="mt-3 text-2xl font-display font-black uppercase tracking-tight text-white">
                                {item.title || 'Abonament'}
                              </h4>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                                <span>{item.trainer || 'Stoica Brothers Academy'}</span>
                                <span className="text-white/20">/</span>
                                <span>{item.location || 'Locatie'}</span>
                              </div>
                              <p className="mt-4 text-3xl font-display font-black text-accent">
                                {item.price || 'Pret neafisat'}
                              </p>
                              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/40">
                                {item.schedule || 'Programul apare aici dupa editare'}
                              </p>
                            </div>

                            <div className="mt-5 space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {detailItems.length > 0 ? detailItems.slice(0, 3).map((detail: string) => (
                                  <span
                                    key={`${item._id || idx}-${detail}`}
                                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60"
                                  >
                                    {detail}
                                  </span>
                                )) : (
                                  <span className="text-xs text-white/25">Adauga beneficii pentru preview.</span>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                  Card preview
                                </span>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black"
                                >
                                  Editeaza
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : activeTab === 'fight-galas' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      No items found in this category.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-muted/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,0,0,0.22),transparent_45%)]" />

                        <div className="relative flex min-h-[320px] flex-col justify-between p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                                0{idx + 1}
                              </span>
                              <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                                {item.highlight || 'Fight Gala'}
                              </span>
                            </div>
                            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-accent hover:text-accent"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-red-500 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                                {item.logo ? (
                                  <img
                                    src={getAssetUrl(item.logo)}
                                    alt={item.name || 'Gala'}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                                    No logo
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                                  Preview gala
                                </p>
                                <h4 className="mt-2 truncate text-2xl font-display font-black uppercase tracking-tight text-white">
                                  {item.name || 'Fight Gala'}
                                </h4>
                              </div>
                            </div>

                            <p className="mt-5 line-clamp-2 text-sm font-semibold uppercase tracking-[0.08em] text-white/70">
                              {item.fighters || 'Adauga numele luptatorilor pentru preview.'}
                            </p>
                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55">
                              {item.description || 'Descrierea scurta a galei va aparea aici dupa editare.'}
                            </p>
                          </div>

                          <div className="mt-5 space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                                {item.location || 'Locatie'}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                                {item.years || 'Perioada'}
                              </span>
                              {item.youtubeUrl && (
                                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-accent">
                                  Video
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                Card preview
                              </span>
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black"
                              >
                                Editeaza
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'gallery' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      No items found in this category.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-muted/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                      >
                        <div className="absolute inset-0">
                          {item.url ? (
                            <img
                              src={getAssetUrl(item.url)}
                              alt={`Galerie ${idx + 1}`}
                              className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
                        </div>

                        <div className="relative flex min-h-[280px] flex-col justify-between p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                              0{idx + 1}
                            </span>
                            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-accent hover:text-accent"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="rounded-xl border border-white/10 bg-black/50 p-2 text-white/70 transition-all hover:border-red-500 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                              Preview galerie
                            </p>
                            <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-white/65">
                              Imaginea din galerie va aparea in homepage si in pagina completa exact din baza de date.
                            </p>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                              Card preview
                            </span>
                            <button
                              onClick={() => handleEdit(item)}
                              className="rounded-full bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black"
                            >
                              Editeaza
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'schedule' ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'].map(day => (
                        <div key={day} className="text-center py-4 bg-white/5 rounded-xl border border-white/10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent">{day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'].map(day => (
                        <div key={day} className="space-y-2 min-h-[400px] bg-white/[0.02] rounded-xl p-2 border border-dashed border-white/5">
                          {items.filter(item => item.day === day).map((item, idx) => (
                            <div 
                              key={item._id || idx} 
                              className="p-3 bg-accent/10 border border-accent/20 rounded-lg group relative"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-black text-accent uppercase tracking-tighter">{item.time}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="text-white/40 hover:text-accent"
                                  >
                                    <Settings size={10} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(item._id)}
                                    className="text-red-500 hover:text-red-400"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                              <h5 className="text-[11px] font-bold text-white uppercase leading-none mb-1">{item.title}</h5>
                              <p className="text-[9px] text-white/40 uppercase tracking-widest">{item.trainer}</p>
                              <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter mt-1">{item.location}</p>
                            </div>
                          ))}
                          <button 
                            onClick={() => setEditingItem({ day })}
                            className="w-full py-3 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-white/10 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <div className="py-20 text-center text-white/10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      No items found in this category.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className={`group p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-accent/40 transition-all ${
                          activeTab === 'competitions'
                            ? 'flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between'
                            : 'flex items-center justify-between'
                        }`}
                      >
	                        <div className="flex-1">
	                          <div className="flex items-center gap-4">
	                            {activeTab === 'coaches' && (
	                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
	                                {item.image ? (
	                                  <img src={getAssetUrl(item.image)} alt={item.name || 'Antrenor'} className="h-full w-full object-cover" />
	                                ) : (
	                                  <span className="text-xs font-black text-white/35">{getInitials(item.name)}</span>
	                                )}
	                              </div>
	                            )}
	                            <h4 className="font-bold text-white uppercase tracking-tight">
	                              {item.title || item.name || item.time || 'Unnamed Item'}
	                            </h4>
	                          </div>
	                          <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">
	                            {activeTab === 'requests' 
	                              ? `Email: ${item.email} | Tel: ${item.phone}` 
	                              : activeTab === 'reviews'
	                                ? `${item.role || 'Cursant Stoica Brothers'} | ${new Date(item.createdAt).toLocaleDateString('ro-RO')}`
	                                : activeTab === 'registrations'
	                                  ? `${item.competitionName} | ${item.weightCategory} | ${item.group} | ${item.coachName}`
	                                  : activeTab === 'competitions'
	                                    ? `${item.location || 'Locatie'} | ${item.date || 'Data'}`
	                                    : activeTab === 'fight-galas'
	                                      ? `${item.location || 'Locatie'} | ${item.years || 'Perioada'}`
	                                      : (item.description || item.day || item.role || item.details || 'No description')
	                            }
	                          </p>
	                          {activeTab === 'requests' && (
	                            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
	                              <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Interes: {item.interest}</p>
	                              <p className="text-xs text-white/60 leading-relaxed italic">"{item.message}"</p>
	                              <p className="text-[8px] text-white/20 mt-2 uppercase">{new Date(item.createdAt).toLocaleString('ro-RO')}</p>
	                            </div>
	                          )}
	                          {activeTab === 'reviews' && (
	                            <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4">
	                              <div className="flex flex-col gap-4 md:flex-row md:items-start">
	                                <div className="flex items-center gap-3">
	                                  {item.image ? (
	                                    <img
	                                      src={getAssetUrl(item.image)}
	                                      alt={item.name || 'Recenzie'}
	                                      className="h-14 w-14 rounded-full object-cover object-top"
	                                    />
	                                  ) : (
	                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black text-white/35">
	                                      {(item.name || 'SB').slice(0, 2).toUpperCase()}
	                                    </div>
	                                  )}
	                                  <div className="md:hidden">
	                                    <p className="text-sm font-bold uppercase tracking-wide text-white">{item.name || 'Recenzie anonima'}</p>
	                                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
	                                      item.status === 'approved'
	                                        ? 'bg-emerald-500/15 text-emerald-300'
	                                        : item.status === 'disabled'
	                                          ? 'bg-white/10 text-white/45'
	                                          : 'bg-amber-500/15 text-amber-300'
	                                    }`}>
	                                      {item.status === 'approved' ? 'Publicat' : item.status === 'disabled' ? 'Ascuns' : 'In asteptare'}
	                                    </span>
	                                  </div>
	                                </div>
	                                <div className="min-w-0 flex-1">
	                                  <div className="hidden items-center gap-3 md:flex">
	                                    <p className="text-sm font-bold uppercase tracking-wide text-white">{item.name || 'Recenzie anonima'}</p>
	                                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
	                                      item.status === 'approved'
	                                        ? 'bg-emerald-500/15 text-emerald-300'
	                                        : item.status === 'disabled'
	                                          ? 'bg-white/10 text-white/45'
	                                          : 'bg-amber-500/15 text-amber-300'
	                                    }`}>
	                                      {item.status === 'approved' ? 'Publicat' : item.status === 'disabled' ? 'Ascuns' : 'In asteptare'}
	                                    </span>
	                                  </div>
	                                  <div className="mt-3 flex items-center gap-1">
	                                    {Array.from({ length: 5 }).map((_, starIndex) => (
	                                      <Star
	                                        key={starIndex}
	                                        size={13}
	                                        className={starIndex < (Number(item.rating) || 5) ? 'fill-[#ffc700] text-[#ffc700]' : 'text-white/15'}
	                                      />
	                                    ))}
	                                  </div>
	                                  <p className="mt-3 text-sm leading-relaxed text-white/65 italic">"{item.text}"</p>
	                                </div>
	                              </div>
	                            </div>
	                          )}
                          {activeTab === 'registrations' && (
                            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 grid md:grid-cols-2 gap-3">
                              <p className="text-xs text-white/60"><span className="text-accent font-bold">Elev:</span> {item.fullName}</p>
                              <p className="text-xs text-white/60"><span className="text-accent font-bold">Experienta:</span> {item.experience}</p>
                              <p className="text-xs text-white/60"><span className="text-accent font-bold">Categorie:</span> {item.weightCategory}</p>
                              <p className="text-xs text-white/60"><span className="text-accent font-bold">Antrenor:</span> {item.coachName}</p>
                              <p className="text-[10px] text-white/25 md:col-span-2">{new Date(item.createdAt).toLocaleString('ro-RO')}</p>
                            </div>
                          )}
                          {activeTab === 'competitions' && (
                            <div className="mt-5 space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-accent">Inscrieri pe antrenor</p>
                              {getRegistrationsByCoach(item).map(({ coach, registrations }) => {
                                const groupKey = `${item._id}-${coach.id}`;
                                const isExpanded = !!expandedRegistrationGroups[groupKey];

                                return (
                                  <div key={coach.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                    <button
                                      type="button"
                                      onClick={() => toggleRegistrationGroup(groupKey)}
                                      className="flex w-full items-center justify-between gap-4 text-left"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-sm font-bold uppercase tracking-widest text-white">{coach.name}</h5>
                                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/25">
                                          {registrations.length > 0
                                            ? `${registrations.length} inscrieri`
                                            : 'Fara inscrieri'}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="rounded-full bg-accent/15 px-3 py-1 text-[10px] font-black text-accent">
                                          {registrations.length}
                                        </span>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/50 transition-all hover:border-accent hover:text-accent">
                                          <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                          />
                                        </span>
                                      </div>
                                    </button>

                                    {isExpanded && (
                                      registrations.length > 0 ? (
                                        <div className="mt-4 space-y-2">
                                          {registrations.map((registration: any) => (
                                            <div
                                              key={registration._id}
                                              className="border-t border-white/5 pt-3 text-xs text-white/55"
                                            >
                                              <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:gap-2">
                                                <span className="font-bold text-white/80">{registration.fullName}</span>
                                                <span>
                                                  <span className="mr-2 text-white/25 md:hidden">Kg</span>
                                                  {registration.weightCategory}
                                                </span>
                                                <span>
                                                  <span className="mr-2 text-white/25 md:hidden">Experienta</span>
                                                  {registration.experience} meciuri
                                                </span>
                                                <span>
                                                  <span className="mr-2 text-white/25 md:hidden">Grupa</span>
                                                  {registration.group}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="mt-4 text-xs text-white/25">Nu sunt inscrieri pentru acest antrenor.</p>
                                      )
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-2 transition-opacity ${
                            activeTab === 'competitions'
                              ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100 ml-0 md:ml-4 self-end'
                              : 'opacity-0 group-hover:opacity-100 ml-4'
                          }`}
                        >
	                          {activeTab !== 'requests' && activeTab !== 'registrations' && activeTab !== 'reviews' && (
	                            <button
	                              onClick={() => handleEdit(item)}
	                              className="p-2 bg-white/5 rounded-lg hover:bg-accent transition-all"
	                            >
	                              <Settings size={14} />
	                            </button>
	                          )}
	                          {activeTab === 'reviews' && (
	                            <>
	                              <button
	                                onClick={() => handleReviewStatusChange(item._id, 'approved')}
	                                className="rounded-lg bg-emerald-500/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 transition-all hover:bg-emerald-500/25"
	                              >
	                                Publica
	                              </button>
	                              <button
	                                onClick={() => handleReviewStatusChange(item._id, 'disabled')}
	                                className="rounded-lg bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/65 transition-all hover:bg-white/10"
	                              >
	                                Ascunde
	                              </button>
	                            </>
	                          )}
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-white/5 rounded-lg hover:bg-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Modal Placeholder for Add/Edit */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white/5 border border-white/10 p-8 rounded-3xl w-full relative max-h-[90vh] overflow-y-auto ${
              activeTab === 'design' && editingItem.designSection === 'hero' ? 'max-w-6xl' : 'max-w-lg'
            }`}
          >
            <button onClick={() => setEditingItem(null)} className="absolute top-6 right-6 text-white/30 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-8">
	              {activeTab === 'design'
	                ? `Edit ${
	                    editingItem.designSection === 'palmares'
	                      ? 'Palmares'
	                      : editingItem.designSection === 'location-config'
	                        ? 'Adresa'
	                      : editingItem.designSection === 'logo'
	                          ? 'Logo'
	                          : editingItem.designSection === 'cta-photo'
	                            ? 'Section Photo'
	                            : editingItem.designSection === 'socials'
	                              ? 'Social Links'
	                          : 'Hero'
	                  }`
	                : `${editingItem._id ? 'Edit' : 'Add New'} ${TABS.find(t => t.id === activeTab)?.label}`}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              {renderFormFields()}

              {activeTab === 'gallery' && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                      Upload multiplu
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                      Selectezi mai multe poze o singura data, iar la salvare se creeaza automat cate un item pentru fiecare imagine.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/40 px-4 py-5 text-center text-sm font-bold uppercase tracking-[0.18em] text-white/45 transition-all hover:border-accent hover:bg-accent/5 hover:text-accent">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryBatchUpload} />
                    Selecteaza mai multe poze
                  </label>

                  {Array.isArray(editingItem.galleryUrls) && editingItem.galleryUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {editingItem.galleryUrls.map((url: string, idx: number) => (
                        <div key={`${url}-${idx}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                          <img src={getAssetUrl(url)} alt={`Galerie ${idx + 1}`} className="h-28 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-8 py-4 bg-white/5 text-white/50 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-accent text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-accent/20"
                >
                  {editingItem._id ? 'Save Changes' : 'Save Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
