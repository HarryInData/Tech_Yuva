const { supabaseAdmin, isConfigured } = require('../config/supabase');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

async function submitContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!isConfigured) {
      emailService
        .sendContactNotification({ name, email, subject, message })
        .catch((err) => logger.warn(`Contact email dispatch error: ${err.message}`));

      return res.status(201).json(
        ApiResponse.created(null, 'Your message has been received! Our team will respond shortly.')
      );
    }

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, subject, message, ip_address: String(ip) }])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    // Notify guild administrators via email
    emailService
      .sendContactNotification({ name, email, subject, message })
      .catch((err) => logger.warn(`Contact email notification failed: ${err.message}`));

    res.status(201).json(
      ApiResponse.created(data, 'Your message has been received! Our team will respond shortly.')
    );
  } catch (error) {
    next(error);
  }
}

async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body;

    if (!isConfigured) {
      return res.status(201).json(
        ApiResponse.created(null, 'Thank you for subscribing to Tech Yuva updates!')
      );
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email, is_active: true }, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.status(201).json(
      ApiResponse.created(data, 'Thank you for subscribing to Tech Yuva updates!')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitContact,
  subscribeNewsletter,
};
