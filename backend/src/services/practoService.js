const logger = require('../utils/logger');

class PractoService {
  constructor() {
    // In real implementation, this would connect to Practo API
    this.mockDoctors = [
      {
        id: 'dr_001',
        name: 'Dr. Sarah Ahmed',
        specialty: 'General Medicine',
        rating: 4.8,
        experience: '8 years',
        languages: ['English', 'Arabic', 'Dari'],
        availability: 'Available Now',
        subsidized: true,
        consultationFee: 0,
        ngoPartner: 'UNHCR Health Program',
        avatar: '👩‍⚕️',
        videoEnabled: true,
        audioEnabled: true
      },
      {
        id: 'dr_002', 
        name: 'Dr. Michael Chen',
        specialty: 'Internal Medicine',
        rating: 4.9,
        experience: '12 years',
        languages: ['English', 'Mandarin'],
        availability: 'Available in 15 mins',
        subsidized: false,
        consultationFee: 25,
        ngoPartner: null,
        avatar: '👨‍⚕️',
        videoEnabled: true,
        audioEnabled: true
      },
      {
        id: 'dr_003',
        name: 'Dr. Fatima Al-Rashid',
        specialty: 'Emergency Medicine',
        rating: 4.7,
        experience: '6 years', 
        languages: ['Arabic', 'English', 'French'],
        availability: 'Available Now',
        subsidized: true,
        consultationFee: 0,
        ngoPartner: 'Doctors Without Borders',
        avatar: '👩‍⚕️',
        videoEnabled: true,
        audioEnabled: true
      }
    ];
  }

  async findAvailableDoctors(criteria = {}) {
    try {
      logger.info('🔍 Finding available doctors with criteria:', criteria);
      
      let filteredDoctors = [...this.mockDoctors];

      // Filter by specialty
      if (criteria.specialty) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.specialty.toLowerCase().includes(criteria.specialty.toLowerCase())
        );
      }

      // Filter by language
      if (criteria.language && criteria.language !== 'en') {
        filteredDoctors = filteredDoctors.filter(doctor =>
          doctor.languages.some(lang => 
            lang.toLowerCase().includes(this.getLanguageName(criteria.language).toLowerCase())
          )
        );
      }

      // Prioritize subsidized doctors for refugees
      filteredDoctors.sort((a, b) => {
        if (a.subsidized && !b.subsidized) return -1;
        if (!a.subsidized && b.subsidized) return 1;
        return b.rating - a.rating; // Then by rating
      });

      // Add consultation fee information
      filteredDoctors = filteredDoctors.map(doctor => ({
        ...doctor,
        consultationFee: doctor.subsidized ? 'Free (NGO Sponsored)' : `$${doctor.consultationFee}`,
        urgencyMatch: this.getUrgencyMatch(doctor.specialty, criteria.urgency)
      }));

      logger.info(`✅ Found ${filteredDoctors.length} available doctors`);
      return filteredDoctors;
    } catch (error) {
      logger.error('❌ Error finding doctors:', error.message);
      return [];
    }
  }

  async bookConsultation(bookingData) {
    try {
      logger.info('📅 Booking consultation:', bookingData);
      
      // In real implementation, this would call Practo API
      const booking = {
        bookingId: `booking_${Date.now()}`,
        doctorId: bookingData.doctorId,
        patientId: bookingData.patientId,
        consultationType: bookingData.consultationType,
        scheduledTime: bookingData.preferredTime || new Date(Date.now() + 5 * 60000), // 5 mins from now
        status: 'confirmed',
        meetingLink: bookingData.consultationType === 'video' 
          ? `https://practo.in/video/${bookingData.doctorId}_${bookingData.patientId}`
          : null,
        phoneNumber: bookingData.consultationType === 'audio'
          ? `+1-800-PRACTO-${Math.floor(Math.random() * 1000)}`
          : null,
        subsidized: bookingData.subsidized,
        paymentRequired: !bookingData.subsidized,
        instructions: [
          'Join the call 5 minutes early',
          'Have your symptoms list ready',
          'Ensure stable internet connection',
          'Keep ID document handy if required'
        ]
      };

      logger.info('✅ Consultation booked successfully');
      return booking;
    } catch (error) {
      logger.error('❌ Booking failed:', error.message);
      throw error;
    }
  }

  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'ar': 'Arabic', 
      'dari': 'Dari'
    };
    return languages[code] || 'English';
  }

  getUrgencyMatch(specialty, urgency) {
    if (urgency === 'high' && specialty.includes('Emergency')) return 'high';
    if (urgency === 'medium' && (specialty.includes('Internal') || specialty.includes('General'))) return 'medium';
    return 'low';
  }
}

module.exports = new PractoService();
