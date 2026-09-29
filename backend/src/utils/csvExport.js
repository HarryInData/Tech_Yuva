const { AsyncParser } = require('json2csv');

/**
 * Transforms records into a downloadable CSV string
 * @param {Array<Object>} data
 * @param {Array<String>} fields
 * @returns {Promise<String>}
 */
async function generateCsv(data, fields) {
  try {
    const opts = fields ? { fields } : {};
    const parser = new AsyncParser(opts);
    const csv = await parser.parse(data).promise();
    return csv;
  } catch (error) {
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
}

module.exports = {
  generateCsv,
};
