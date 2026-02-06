// ================================
// Shared storage utilities (FIXED)
// ================================

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  _count?: {
    itineraries: number;
  };
}

interface Itinerary {
  id: string;
  title: string;
  description: string;
  duration: number;
  nights?: number;
  price: number;
  image?: string;
  isActive: boolean;
  categoryId: string;
  rating?: number;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  days?: {
    title: string;
    image: string;
    description: string;
    activities: string[];
  }[];
}

const CATEGORY_KEY = "adminCategories";
const ITINERARY_KEY = "adminItineraries";

// =================================
// Helpers
// =================================

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2);

const dispatchUpdate = (type: string) => {
  window.dispatchEvent(
    new CustomEvent("storage-updated", { detail: { type } })
  );
};

// =================================
// Category Storage
// =================================

export const categoryStorage = {
  getCategories: (): Category[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(CATEGORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  setCategories: (categories: Category[]): void => {
    if (typeof window === "undefined") return;

    // auto update counts
    const itineraries = itineraryStorage.getItineraries();

    const withCounts = categories.map((cat) => ({
      ...cat,
      _count: {
        itineraries: itineraries.filter(
          (i) => i.categoryId === cat.id
        ).length,
      },
    }));

    localStorage.setItem(CATEGORY_KEY, JSON.stringify(withCounts));
    dispatchUpdate("categories");
  },

  addCategory: (category: Omit<Category, "id">): Category => {
    const categories = categoryStorage.getCategories();

    const newCategory: Category = {
      ...category,
      id: generateId(),
    };

    categoryStorage.setCategories([...categories, newCategory]);
    return newCategory;
  },

  updateCategory: (id: string, updates: Partial<Category>) => {
    const categories = categoryStorage.getCategories();

    const updated = categories.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );

    categoryStorage.setCategories(updated);
  },

  deleteCategory: (id: string) => {
    const categories = categoryStorage.getCategories();

    const filtered = categories.filter((c) => c.id !== id);
    categoryStorage.setCategories(filtered);

    // move itineraries to unknown
    const itineraries = itineraryStorage.getItineraries();

    itineraryStorage.setItineraries(
      itineraries.map((i) =>
        i.categoryId === id ? { ...i, categoryId: "unknown" } : i
      )
    );
  },
};

// =================================
// Itinerary Storage
// =================================

export const itineraryStorage = {
  getItineraries: (): Itinerary[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ITINERARY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  setItineraries: (itineraries: Itinerary[]): void => {
    if (typeof window === "undefined") return;

    localStorage.setItem(ITINERARY_KEY, JSON.stringify(itineraries));

    // refresh counts automatically
    const categories = categoryStorage.getCategories();
    categoryStorage.setCategories(categories);

    dispatchUpdate("itineraries");
  },

  addItinerary: (itinerary: Omit<Itinerary, "id">): Itinerary => {
    const itineraries = itineraryStorage.getItineraries();

    const newItinerary: Itinerary = {
      ...itinerary,
      id: generateId(),
    };

    itineraryStorage.setItineraries([...itineraries, newItinerary]);
    return newItinerary;
  },

  updateItinerary: (id: string, updates: Partial<Itinerary>) => {
    const itineraries = itineraryStorage.getItineraries();

    const updated = itineraries.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );

    itineraryStorage.setItineraries(updated);
  },

  deleteItinerary: (id: string) => {
    const itineraries = itineraryStorage.getItineraries();

    itineraryStorage.setItineraries(
      itineraries.filter((i) => i.id !== id)
    );
  },
};

// =================================
// Utils
// =================================

export const getCategoryName = (categoryId: string): string => {
  const categories = categoryStorage.getCategories();
  return (
    categories.find((c) => c.id === categoryId)?.name ||
    "Unknown Category"
  );
};

export const getItinerariesWithCategories = () => {
  const itineraries = itineraryStorage.getItineraries();
  const categories = categoryStorage.getCategories();

  return itineraries.map((i) => ({
    ...i,
    category: {
      id: i.categoryId,
      name: categories.find(c => c.id === i.categoryId)?.name || "Unknown Category"
    }
  }));
};

// =================================
// Default Data (ADD THIS)
// =================================

const getDefaultCategories = (): Category[] => {
  return [
    {
      id: "cat1",
      name: "Hill Stations",
      isActive: true,
      _count: { itineraries: 0 }
    },
    {
      id: "cat2",
      name: "Beach Trips",
      isActive: true,
      _count: { itineraries: 0 }
    }
  ];
};

const getDefaultItineraries = (): Itinerary[] => {
  return [];
};



// =================================
// SAFE Initialize (FIXED)
// =================================

export const initializeStorage = () => {
  if (typeof window === "undefined") return;

  // ONLY create defaults if empty
  if (!localStorage.getItem(CATEGORY_KEY)) {
    localStorage.setItem(
      CATEGORY_KEY,
      JSON.stringify(getDefaultCategories())
    );
  }

  if (!localStorage.getItem(ITINERARY_KEY)) {
    localStorage.setItem(
      ITINERARY_KEY,
      JSON.stringify(getDefaultItineraries())
    );
  }
};
