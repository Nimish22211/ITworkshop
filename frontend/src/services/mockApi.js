// Lightweight mock API that simulates server responses without altering backend.
// Replace these calls with real endpoints when backend is ready.

export const mockApi = {
  async getAdminMetrics() {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300))
    const now = new Date()
    return {
      generatedAt: now.toISOString(),
      totalComplaints: 12450,
      resolvedComplaints: 9340,
      averageResolutionHours: 36.5, // hours
      escalatedComplaints: 820,
      totalOfficials: 212, // district-level officials
      totalServiceMen: 1460, // via officials
    }
  },
}


