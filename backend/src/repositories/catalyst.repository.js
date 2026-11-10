import catalyst from 'zcatalyst-sdk-node';

// Required Data Store tables (create in the Catalyst console):
//   DiscoveryDrafts: token (varchar 64, unique), payload (text), expires_at (varchar 40)
//   Submissions:     reference (varchar 20, unique), route (varchar 20), payload (text),
//                    crm_status (varchar 20), crm_lead_id (varchar 40), crm_error (text)
//   Products:        sku (varchar 64, unique), category (varchar 60), active (boolean), payload (text)
const DRAFTS = 'DiscoveryDrafts';
const SUBMISSIONS = 'Submissions';
const PRODUCTS = 'Products';
const PAGE = 300; // ZCQL returns at most 300 rows per query

const productRow = (p) => ({
  sku: p.sku,
  category: p.category,
  active: p.active,
  payload: JSON.stringify(p),
});

// Only server-generated tokens/references reach queries; this guard keeps ZCQL injection impossible.
const assertSafe = (value) => {
  if (!/^[A-Za-z0-9-]{1,64}$/.test(value)) throw new Error('Unsafe query value');
  return value;
};

const toDraft = (row) => ({
  rowId: row.ROWID,
  token: row.token,
  expiresAt: row.expires_at,
  ...JSON.parse(row.payload),
});

const toSubmission = (row) => ({
  rowId: row.ROWID,
  ...JSON.parse(row.payload),
  crm: { status: row.crm_status, leadId: row.crm_lead_id || null, error: row.crm_error || null },
});

const submissionRow = (s) => {
  const { crm, rowId, ...rest } = s;
  return {
    reference: s.reference,
    route: s.route,
    payload: JSON.stringify(rest),
    crm_status: crm.status,
    crm_lead_id: crm.leadId || '',
    crm_error: crm.error || '',
  };
};

export function createCatalystRepository(req) {
  const app = catalyst.initialize(req);
  const datastore = app.datastore();
  const zcql = app.zcql();

  const findOne = async (table, column, value) => {
    const rows = await zcql.executeZCQLQuery(
      `SELECT * FROM ${table} WHERE ${column} = '${assertSafe(value)}' LIMIT 1`
    );
    return rows.length ? rows[0][table] : null;
  };

  return {
    async listProducts() {
      const products = [];
      for (let offset = 0; ; offset += PAGE) {
        const rows = await zcql.executeZCQLQuery(`SELECT * FROM ${PRODUCTS} LIMIT ${offset},${PAGE}`);
        products.push(...rows.map((r) => JSON.parse(r[PRODUCTS].payload)));
        if (rows.length < PAGE) return products;
      }
    },

    async upsertProducts(products) {
      let inserted = 0;
      let updated = 0;
      for (const product of products) {
        const row = await findOne(PRODUCTS, 'sku', product.sku);
        if (row) {
          await datastore.table(PRODUCTS).updateRow({ ROWID: row.ROWID, ...productRow(product) });
          updated++;
        } else {
          await datastore.table(PRODUCTS).insertRow(productRow(product));
          inserted++;
        }
      }
      return { inserted, updated };
    },

    async createDraft({ token, expiresAt, ...payload }) {
      await datastore.table(DRAFTS).insertRow({
        token,
        expires_at: expiresAt,
        payload: JSON.stringify(payload),
      });
      return { token, expiresAt, ...payload };
    },

    async getDraft(token) {
      const row = await findOne(DRAFTS, 'token', token);
      return row ? toDraft(row) : null;
    },

    async updateDraft(token, patch) {
      const row = await findOne(DRAFTS, 'token', token);
      if (!row) return null;
      const { token: _t, rowId: _r, expiresAt, ...current } = { ...toDraft(row), ...patch };
      await datastore.table(DRAFTS).updateRow({
        ROWID: row.ROWID,
        expires_at: expiresAt,
        payload: JSON.stringify(current),
      });
      return { token, expiresAt, ...current };
    },

    async createSubmission(submission) {
      await datastore.table(SUBMISSIONS).insertRow(submissionRow(submission));
      return submission;
    },

    async getSubmission(reference) {
      const row = await findOne(SUBMISSIONS, 'reference', reference);
      return row ? toSubmission(row) : null;
    },

    async updateSubmission(reference, patch) {
      const row = await findOne(SUBMISSIONS, 'reference', reference);
      if (!row) return null;
      const next = { ...toSubmission(row), ...patch };
      await datastore.table(SUBMISSIONS).updateRow({ ROWID: row.ROWID, ...submissionRow(next) });
      return next;
    },

    async listSubmissions({ crmStatus } = {}) {
      const where = crmStatus ? ` WHERE crm_status = '${assertSafe(crmStatus)}'` : '';
      const rows = await zcql.executeZCQLQuery(
        `SELECT * FROM ${SUBMISSIONS}${where} ORDER BY CREATEDTIME DESC LIMIT 200`
      );
      return rows.map((r) => toSubmission(r[SUBMISSIONS]));
    },
  };
}
