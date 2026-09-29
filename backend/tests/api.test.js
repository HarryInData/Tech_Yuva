const request = require('supertest');
const app = require('../src/app');

describe('Tech Yuva API Test Suite', () => {
  describe('GET /api/v1/health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('tech-yuva-api');
    });
  });

  describe('GET /api/v1/stats', () => {
    it('should return live impact metrics with numeric values', async () => {
      const res = await request(app).get('/api/v1/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('activeMembers');
      expect(res.body.data).toHaveProperty('eventsHosted');
      expect(res.body.data).toHaveProperty('prototypesBuilt');
      expect(res.body.data).toHaveProperty('buildersImpacted');
      expect(typeof res.body.data.activeMembers).toBe('number');
    });
  });

  describe('GET /api/v1/cohorts/current', () => {
    it('should return active cohort and badge label', async () => {
      const res = await request(app).get('/api/v1/cohorts/current');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('badgeLabel');
      expect(res.body.data).toHaveProperty('isAdmissionsOpen');
      expect(res.body.data.badgeLabel).toContain('Cohort');
    });
  });

  describe('GET /api/v1/events', () => {
    it('should list upcoming events including DropHack', async () => {
      const res = await request(app).get('/api/v1/events');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.events)).toBe(true);
      expect(res.body.data.events.length).toBeGreaterThan(0);
    });

    it('should fetch single event by slug', async () => {
      const res = await request(app).get('/api/v1/events/drophack-26');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('drophack-26');
    });
  });

  describe('POST /api/v1/community/join', () => {
    it('should reject submission with missing required fields (validation test)', async () => {
      const res = await request(app)
        .post('/api/v1/community/join')
        .send({ email: 'bad-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation Error');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should accept valid community join application', async () => {
      const testEmail = `test.builder.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/community/join')
        .send({
          fullName: 'Test Builder',
          email: testEmail,
          phone: '+919876543210',
          college: 'Delhi Technological University',
          city: 'New Delhi',
          interests: ['AI', 'Web3', 'Cyber Security'],
          githubUrl: 'https://github.com/techyuva',
          cohortYear: 2026,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('applicationId');
      expect(res.body.data.status).toBe('pending');
    });
  });

  describe('POST /api/v1/events/:id/register', () => {
    it('should register a candidate for DropHack', async () => {
      const regEmail = `drophack.reg.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/events/drophack-26/register')
        .send({
          fullName: 'Hackathon Contender',
          email: regEmail,
          phone: '+919876543211',
          college: 'IIT Delhi',
          teamName: 'CyberPunks',
          teamMembers: ['Alice', 'Bob'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'confirmed');
    });
  });

  describe('POST /api/v1/contact', () => {
    it('should accept valid contact inquiries', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Partner Organization',
          email: 'partners@example.org',
          subject: 'Sponsorship for DropHack 2026',
          message: 'We would love to sponsor cloud infrastructure credits for the hackathon finalists.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
