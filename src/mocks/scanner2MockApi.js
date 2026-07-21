const MASTER_PRODUCTS = [
  {
    TTBA_No: "BB/2026/001",
    TTBA_SeqID: 1,
    No_analisa: "DNC-BB-0001",
    ttba_itemid: "BB 0001",
    item_name: "LACTOSE_MONOHYDRATE",
    group_name: "Excipient",
    po_suppname: "PT Supplier Baku",
    Tgl_daluarsa: "31 Dec 2027",
    TTBA_VATQTY: 4,
    ttba_qty: 1000,
    ttba_itemUnit: "kg",
    Item_TypeGroup: "BB",
    Status: "Release",
  },
  {
    TTBA_No: "BK/2026/010",
    TTBA_SeqID: 7,
    No_analisa: "DNC-BK-0107",
    ttba_itemid: "BK 0107",
    item_name: "ALUFOIL_PACKING",
    group_name: "Packaging",
    po_suppname: "PT Supplier Kemas",
    Tgl_daluarsa: "30 Nov 2028",
    TTBA_VATQTY: 3,
    ttba_qty: 600,
    ttba_itemUnit: "roll",
    Item_TypeGroup: "BK",
    Status: "Karantina",
  },
];

const RACK_MASTER = {
  "BB2/R1/1/1": { tipe_item: "bb", occupied: [] },
  "BB2/R1/1/2": {
    tipe_item: "bb",
    occupied: ["BB/2026/001#1#1"],
  },
  "BK2/K1/1/1": { tipe_item: "bk", occupied: [] },
  "BK2/K1/1/2": {
    tipe_item: "bk",
    occupied: ["BK/2026/010#7#1"],
  },
  "AF2/A1/1/1": { tipe_item: "bk", occupied: [] },
};

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findMasterProduct(ttba, seqId) {
  return MASTER_PRODUCTS.find(
    (item) => item.TTBA_No === ttba && Number(item.TTBA_SeqID) === Number(seqId)
  );
}

function createVatProduct(master, vat) {
  return {
    ...master,
    ttba_vatno: Number(vat),
    TTBA_qty_per_Vat: Math.ceil(master.ttba_qty / master.TTBA_VATQTY),
  };
}

export async function fetchProductMock({ ttba, seqId, vat }) {
  await wait();

  const master = findMasterProduct(ttba, seqId);
  if (!master || !vat || Number.isNaN(Number(vat))) {
    const error = new Error("TTBA tidak ditemukan");
    error.response = { data: { message: "TTBA tidak ditemukan" } };
    throw error;
  }

  if (Number(vat) < 1 || Number(vat) > Number(master.TTBA_VATQTY)) {
    const error = new Error("Product Not Found");
    error.response = { data: { message: "Product Not Found" } };
    throw error;
  }

  const product = createVatProduct(master, vat);
  return { product: [product], statusVatFound: product.Status };
}

export async function fetchRackByArrTtbaBulkInsertMock({
  scannedRack,
  ttbaScanned,
  tipeItemScanned,
}) {
  await wait();

  const rack = RACK_MASTER[scannedRack];
  if (!rack) {
    const error = new Error("Rack Not Found");
    error.response = { data: { message: "Rack Not Found" } };
    throw error;
  }

  const mismatchType = (tipeItemScanned || []).some(
    (item) => String(item || "").toLowerCase() !== String(rack.tipe_item || "")
  );

  if (mismatchType) {
    const error = new Error("Tipe Rak tidak sama");
    error.response = { data: { message: "Tipe Rak tidak sama" } };
    throw error;
  }

  const result = (ttbaScanned || [])
    .filter((item) => rack.occupied.includes(item))
    .map((dncTtbaNo) => {
      const [TTBA_No, TTBA_SeqID, ttba_vatno] = dncTtbaNo.split("#");
      const master = findMasterProduct(TTBA_No, TTBA_SeqID);

      return {
        Lokasi: scannedRack.split("/")[0],
        Rak: scannedRack.split("/")[1],
        Baris: scannedRack.split("/")[2],
        Kolom: scannedRack.split("/")[3],
        DNc_TTBANo: dncTtbaNo,
        Item_Name: master?.item_name || "UNKNOWN",
        Qty: master
          ? Math.ceil(master.ttba_qty / master.TTBA_VATQTY)
          : 0,
      };
    });

  return {
    result,
    tipeRak: [{ tipe_item: rack.tipe_item }],
  };
}

export async function insertBulkProductToRackMock({
  scannedRack,
  products,
  savedMappings,
}) {
  await wait();

  if (!scannedRack || !Array.isArray(products) || products.length === 0) {
    const error = new Error("Missing required fields");
    error.response = { data: { message: "Missing required fields" } };
    throw error;
  }

  const mappedItems = products.flatMap(
    (item) => Array.from({ length: item.TTBA_VATQTY }, (_, idx) => 
      `${item.TTBA_No}#${item.TTBA_SeqID}#${idx + 1}`
    )
  );

  const allMapped = (savedMappings || []).flatMap((mapping) =>
    mapping.products.flatMap(
      (item) => Array.from({ length: item.TTBA_VATQTY }, (_, idx) => 
        `${item.TTBA_No}#${item.TTBA_SeqID}#${idx + 1}`
      )
    )
  );

  const duplicate = mappedItems.find((x) => allMapped.includes(x));
  if (duplicate) {
    const error = new Error(`Product ${duplicate} sudah pernah dilakukan pemetaan gudang`);
    error.response = {
      data: {
        message: `Product ${duplicate} sudah pernah dilakukan pemetaan gudang`,
      },
    };
    throw error;
  }

  const rack = RACK_MASTER[scannedRack];
  if (!rack) {
    const error = new Error("Rack Not Found");
    error.response = { data: { message: "Rack Not Found" } };
    throw error;
  }

  rack.occupied = Array.from(new Set([...rack.occupied, ...mappedItems]));

  return {
    message: "Product added successfully",
    mappedItems,
    scannedRack,
  };
}

// ─── ScannerRack3 dummy data ────────────────────────────────────────────────

const RACK_CONTENTS = {
  "BB2/R1/1/1": [
    { DNc_No: "DNC-BB-0001", no_label: "BB/2026/001#1#1", Item_Name: "LACTOSE MONOHYDRATE", item_ID: "BB 0001", Qty: 250, Status: "Release" },
    { DNc_No: "DNC-BB-0001", no_label: "BB/2026/001#1#2", Item_Name: "LACTOSE MONOHYDRATE", item_ID: "BB 0001", Qty: 250, Status: "Release" },
    { DNc_No: "DNC-BB-0002", no_label: "BB/2026/002#1#1", Item_Name: "MAGNESIUM STEARATE",   item_ID: "BB 0002", Qty: 100, Status: "Karantina" },
  ],
  "BB2/R1/1/2": [
    { DNc_No: "DNC-BB-0001", no_label: "BB/2026/001#1#3", Item_Name: "LACTOSE MONOHYDRATE", item_ID: "BB 0001", Qty: 250, Status: "Reject" },
  ],
  "BK2/K1/1/1": [
    { DNc_No: "DNC-BK-0107", no_label: "BK/2026/010#7#1", Item_Name: "ALUFOIL PACKING", item_ID: "BK 0107", Qty: 200, Status: "Karantina" },
    { DNc_No: "DNC-BK-0107", no_label: "BK/2026/010#7#2", Item_Name: "ALUFOIL PACKING", item_ID: "BK 0107", Qty: 200, Status: "Karantina" },
  ],
  "BK2/K1/1/2": [
    { DNc_No: "DNC-BK-0107", no_label: "BK/2026/010#7#3", Item_Name: "ALUFOIL PACKING", item_ID: "BK 0107", Qty: 200, Status: "Release" },
  ],
  "AF2/A1/1/1": [],
  "BB2/R2/1/1": [],
  "BK2/K2/1/1": [],
};

export async function fetchRackByLocationMock(scannedRack) {
  await wait();
  const contents = RACK_CONTENTS[scannedRack];
  if (contents === undefined) {
    const error = new Error("Rack tidak ditemukan");
    error.response = { status: 404, data: { message: "Rack tidak ditemukan" } };
    throw error;
  }
  return [...contents];
}

export async function cekRackIntoMock({ scannedRackInto, arrTtbaNo, scannedRackFirst }) {
  await wait();

  if (scannedRackInto === scannedRackFirst) {
    const error = new Error("Rak Tujuan tidak boleh sama dengan Rak Asal");
    error.response = { data: { message: "Rak Tujuan tidak boleh sama dengan Rak Asal" } };
    throw error;
  }

  const dest = RACK_CONTENTS[scannedRackInto];
  if (dest === undefined) {
    const error = new Error("Rack tidak ditemukan");
    error.response = { status: 404, data: { message: "Rack tidak ditemukan" } };
    throw error;
  }

  const srcType = scannedRackFirst?.split("/")[0]?.substring(0, 2);
  const destType = scannedRackInto?.split("/")[0]?.substring(0, 2);
  if (srcType !== destType) {
    const error = new Error("Tipe Rak tidak sama");
    error.response = { data: { message: "Tipe Rak tidak sama" } };
    throw error;
  }

  const existing = dest.filter((item) => arrTtbaNo.includes(item.no_label));
  if (existing.length > 0) {
    const labels = existing.map((i) => i.no_label);
    const error = new Error(`item ${labels} sudah terdaftar pada rak ini`);
    error.response = { data: { message: `item ${labels} sudah terdaftar pada rak ini` } };
    throw error;
  }

  return [];
}

export async function moveRacksMock({ selectedItems, scannedRackFirst, scannedRackInto }) {
  await wait();

  const src = RACK_CONTENTS[scannedRackFirst];
  const dest = RACK_CONTENTS[scannedRackInto];
  if (!src || dest === undefined) {
    const error = new Error("Rack tidak ditemukan");
    error.response = { data: { message: "Rack tidak ditemukan" } };
    throw error;
  }

  const labels = selectedItems.map((i) => i.no_label);
  const toMove = src.filter((i) => labels.includes(i.no_label));
  RACK_CONTENTS[scannedRackFirst] = src.filter((i) => !labels.includes(i.no_label));
  RACK_CONTENTS[scannedRackInto] = [...dest, ...toMove];
  return { message: "Berhasil dipindahkan" };
}

export const quickDemoRacksScannerRack3 = Object.keys(RACK_CONTENTS);

// ─────── Stock Opname Yearly mock data ──────────────────────────────────────────────────────────────────────

const OPNAME_PRODUCTS = {
  "BB2/R1/1/1": [
    {
      DNc_TTBANo: "DNC-BB-0001#1#1",
      DNc_No: "DNC-BB-0001",
      TTBA_No: "BB/2026/001",
      TTBA_SeqID: 1,
      ttba_vatno: 1,
      item_name: "LACTOSE MONOHYDRATE",
      ttba_itemid: "BB 0001",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 250,
      Qty: 250,
      qtyWms: 250,
      QtySampling: 10,
      StatusVat: "Release",
      StatusSampling: "Done",
      Lokasi: "BB2",
      Rak: "R1",
      Baris: "1",
      Kolom: "1",
    },
    {
      DNc_TTBANo: "DNC-BB-0001#1#2",
      DNc_No: "DNC-BB-0001",
      TTBA_No: "BB/2026/001",
      TTBA_SeqID: 1,
      ttba_vatno: 2,
      item_name: "LACTOSE MONOHYDRATE",
      ttba_itemid: "BB 0001",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 250,
      Qty: 250,
      qtyWms: 248,
      QtySampling: 10,
      StatusVat: "Release",
      StatusSampling: "Done",
      Lokasi: "BB2",
      Rak: "R1",
      Baris: "1",
      Kolom: "1",
    },
    {
      DNc_TTBANo: "DNC-BB-0001#1#3",
      DNc_No: "DNC-BB-0001",
      TTBA_No: "BB/2026/001",
      TTBA_SeqID: 1,
      ttba_vatno: 3,
      item_name: "LACTOSE MONOHYDRATE",
      ttba_itemid: "BB 0001",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 250,
      Qty: 250,
      qtyWms: 250,
      QtySampling: 10,
      StatusVat: "Release",
      StatusSampling: "Done",
      Lokasi: "BB2",
      Rak: "R1",
      Baris: "1",
      Kolom: "1",
    },
    {
      DNc_TTBANo: "DNC-BB-0003#2#1",
      DNc_No: "DNC-BB-0003",
      TTBA_No: "BB/2026/003",
      TTBA_SeqID: 2,
      ttba_vatno: 1,
      item_name: "CELLULOSE POWDER",
      ttba_itemid: "BB 0003",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 200,
      Qty: 200,
      qtyWms: 200,
      QtySampling: 8,
      StatusVat: "Release",
      StatusSampling: "Pending",
      Lokasi: "BB2",
      Rak: "R1",
      Baris: "1",
      Kolom: "1",
    },
  ],
  "BB2/R1/1/2": [
    {
      DNc_TTBANo: "DNC-BB-0002#1#1",
      DNc_No: "DNC-BB-0002",
      TTBA_No: "BB/2026/002",
      TTBA_SeqID: 1,
      ttba_vatno: 1,
      item_name: "MAGNESIUM STEARATE",
      ttba_itemid: "BB 0002",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 100,
      Qty: 100,
      qtyWms: 100,
      QtySampling: 5,
      StatusVat: "Karantina",
      StatusSampling: "-",
      Lokasi: "BB2",
      Rak: "R1",
      Baris: "1",
      Kolom: "2",
    },
    {
      DNc_TTBANo: "DNC-BB-0002#1#2",
      DNc_No: "DNC-BB-0002",
      TTBA_No: "BB/2026/002",
      TTBA_SeqID: 1,
      ttba_vatno: 2,
      item_name: "MAGNESIUM STEARATE",
      ttba_itemid: "BB 0002",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 100,
      Qty: 100,
      qtyWms: 98,
      QtySampling: 5,
      StatusVat: "Release",
      StatusSampling: "Done",
      Lokasi: "BB2",
      Rak: "R1",
      Baris: "1",
      Kolom: "2",
    },
  ],
  "BB2/R2/1/1": [
    {
      DNc_TTBANo: "DNC-BB-0004#3#1",
      DNc_No: "DNC-BB-0004",
      TTBA_No: "BB/2026/004",
      TTBA_SeqID: 3,
      ttba_vatno: 1,
      item_name: "TALC POWDER",
      ttba_itemid: "BB 0004",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 300,
      Qty: 300,
      qtyWms: 300,
      QtySampling: 12,
      StatusVat: "Release",
      StatusSampling: "Done",
      Lokasi: "BB2",
      Rak: "R2",
      Baris: "1",
      Kolom: "1",
    },
    {
      DNc_TTBANo: "DNC-BB-0004#3#2",
      DNc_No: "DNC-BB-0004",
      TTBA_No: "BB/2026/004",
      TTBA_SeqID: 3,
      ttba_vatno: 2,
      item_name: "TALC POWDER",
      ttba_itemid: "BB 0004",
      ttba_itemUnit: "kg",
      TTBA_qty_per_Vat: 300,
      Qty: 300,
      qtyWms: 295,
      QtySampling: 12,
      StatusVat: "Release",
      StatusSampling: "Done",
      Lokasi: "BB2",
      Rak: "R2",
      Baris: "1",
      Kolom: "1",
    },
  ],
};

export async function fetchProductStockOpnameMock({ ttba, seqId, vat, scannedRack }) {
  await wait();
  
  const racksWithProduct = OPNAME_PRODUCTS[scannedRack] || [];
  const found = racksWithProduct.filter(
    (p) =>
      p.TTBA_No === ttba &&
      p.TTBA_SeqID === Number(seqId)
  );

  if (found.length === 0) {
    const error = new Error("Pemetaan Gudang tidak ditemukan");
    error.response = {
      status: 404,
      data: { message: "Pemetaan Gudang tidak ditemukan" },
    };
    throw error;
  }

  return {
    product: found,
    totalSamplingQc: 10,
    totalGudangDetail: found.reduce((sum, p) => sum + p.Qty, 0),
    totalPenimbangan: 0,
    totalPenarikan: 0,
    totalGudangDetailperRak: found.reduce((sum, p) => sum + p.Qty, 0),
  };
}

export async function submitStockOpnameMock({ product, scannedRack }) {
  await wait();
  return {
    message: "Berhasil disimpan",
    data: product,
  };
}

export const mockOpnameList = [
  {
    DNc_No: "DNC-BB-0001",
    TTBA_No: "BB/2026/001",
    item_name: "LACTOSE MONOHYDRATE",
    ttba_vatno: 1,
    Qty: 250,
    qty_so: 250,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0001",
    TTBA_No: "BB/2026/001",
    item_name: "LACTOSE MONOHYDRATE",
    ttba_vatno: 2,
    Qty: 250,
    qty_so: 248,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0001",
    TTBA_No: "BB/2026/001",
    item_name: "LACTOSE MONOHYDRATE",
    ttba_vatno: 3,
    Qty: 250,
    qty_so: 250,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0003",
    TTBA_No: "BB/2026/003",
    item_name: "CELLULOSE POWDER",
    ttba_vatno: 1,
    Qty: 200,
    qty_so: 200,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0002",
    TTBA_No: "BB/2026/002",
    item_name: "MAGNESIUM STEARATE",
    ttba_vatno: 1,
    Qty: 100,
    qty_so: 100,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0002",
    TTBA_No: "BB/2026/002",
    item_name: "MAGNESIUM STEARATE",
    ttba_vatno: 2,
    Qty: 100,
    qty_so: 98,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0004",
    TTBA_No: "BB/2026/004",
    item_name: "TALC POWDER",
    ttba_vatno: 1,
    Qty: 300,
    qty_so: 300,
    Process_Date: new Date().toISOString(),
  },
  {
    DNc_No: "DNC-BB-0004",
    TTBA_No: "BB/2026/004",
    item_name: "TALC POWDER",
    ttba_vatno: 2,
    Qty: 300,
    qty_so: 295,
    Process_Date: new Date().toISOString(),
  },
];

export const quickDemoLabels = [
  "BB/2026/001#1#1",
  "BB/2026/001#1#2",
  "BB/2026/001#1#3",
  "BB/2026/002#1#1",
  "BB/2026/002#1#2",
  "BB/2026/003#2#1",
  "BB/2026/004#3#1",
  "BB/2026/004#3#2",
  "BK/2026/010#7#1",
  "BK/2026/010#7#2",
  "BK/2026/010#7#3",
  "BK/2026/011#5#1",
  "BK/2026/011#5#2",
  "BK/2026/050#1#1",
  "BK/2026/050#1#2",
  "BB/2026/404#1#1",
];

export const quickDemoRacks = [
  "BB2/R1/1/1",
  "BB2/R1/1/2",
  "BK2/K1/1/1",
  "BK2/K1/1/2",
  "AF2/A1/1/1",
  "ZZ9/R9/9/9",
];

// ─────── ScannerDetailTtba mock data ──────────────────────────────────────────────────────────────────────

const DETAIL_TTBA_PRODUCTS = [
  {
    TTBA_No: "BB/2026/001",
    TTBA_SeqID: 1,
    No_analisa: "DNC-BB-0001",
    ttba_itemid: "BB 0001",
    item_name: "LACTOSE MONOHYDRATE",
    po_suppname: "PT Supplier Baku Indonesia",
    prc_name: "PT Industri ABC",
    ttba_batchno: "BATCH-2026-001A",
    uji_ulang_date: "15 Jan 2026",
    best_before: "31 Dec 2027",
    Tgl_daluarsa: "31 Dec 2027",
    TTBA_VATQTY: 4,
    ttba_qty: 1000,
    ttba_itemUnit: "kg",
    Item_TypeGroup: "BB",
    Status: "Release",
    Status_2: "",
    emp_Name: "Budi Santoso",
    tgl_approve: "2026-01-01T10:30:00Z",
  },
  {
    TTBA_No: "BK/2026/010",
    TTBA_SeqID: 7,
    No_analisa: "DNC-BK-0107",
    ttba_itemid: "BK 0107",
    item_name: "ALUFOIL PACKING",
    po_suppname: "PT Supplier Kemas Maju",
    prc_name: "PT Kemasan Global",
    ttba_batchno: "LOT-BK-2026-10",
    uji_ulang_date: "NA",
    best_before: "30 Nov 2028",
    Tgl_daluarsa: "30 Nov 2028",
    TTBA_VATQTY: 3,
    ttba_qty: 600,
    ttba_itemUnit: "roll",
    Item_TypeGroup: "BK",
    Status: "Karantina",
    Status_2: "Menunggu Hasil Lab",
    emp_Name: "Siti Nurhaliza",
    tgl_approve: "2026-01-05T14:15:00Z",
  },
];

const GUDANG_STOCK_DETAIL = {
  "DNC-BB-0001": {
    gudangUtama: [
      {
        DNc_TTBANo: "BB/2026/001#1#1",
        Dnc_no: "DNC-BB-0001",
        Vat_no: "1",
        Qty: 250,
        Rak: "R1",
        Baris: "1",
        Kolom: "1",
      },
      {
        DNc_TTBANo: "BB/2026/001#1#2",
        Dnc_no: "DNC-BB-0001",
        Vat_no: "2",
        Qty: 250,
        Rak: "R1",
        Baris: "1",
        Kolom: "1",
      },
      {
        DNc_TTBANo: "BB/2026/001#1#3",
        Dnc_no: "DNC-BB-0001",
        Vat_no: "3",
        Qty: 250,
        Rak: "R1",
        Baris: "1",
        Kolom: "1",
      },
    ],
    gudangKecil: [],
    gudangSampling: [],
  },
  "DNC-BK-0107": {
    gudangUtama: [
      {
        DNc_TTBANo: "BK/2026/010#7#1",
        Dnc_no: "DNC-BK-0107",
        Vat_no: "1",
        Qty: 200,
        Rak: "K1",
        Baris: "1",
        Kolom: "1",
      },
    ],
    gudangKecil: [
      {
        DNc_TTBANo: "BK/2026/010#7#2",
        Dnc_no: "DNC-BK-0107",
        Vat_no: "2",
        Qty: 150,
        Rak: "K1",
        Baris: "1",
        Kolom: "2",
      },
    ],
    gudangSampling: [
      {
        DNc_TTBANo: "BK/2026/010#7#3",
        Dnc_no: "DNC-BK-0107",
        Vat_no: "3",
        Qty: 50,
        Rak: "PREP",
        Baris: "-",
        Kolom: "-",
      },
    ],
  },
};

export async function fetchProductDetailMock({ ttba, seqId, vat }) {
  await wait();

  const cleanTtba = ttba?.replace(/-/g, "/");
  const product = DETAIL_TTBA_PRODUCTS.find(
    (p) => p.TTBA_No === cleanTtba && Number(p.TTBA_SeqID) === Number(seqId)
  );

  if (!product) {
    const error = new Error("Product Not Found");
    error.response = { data: { message: "Product Not Found" } };
    throw error;
  }

  if (Number(vat) < 1 || Number(vat) > Number(product.TTBA_VATQTY)) {
    const error = new Error("VAT tidak valid");
    error.response = { data: { message: "VAT tidak valid" } };
    throw error;
  }

  const allVats = [];
  for (let v = 1; v <= product.TTBA_VATQTY; v++) {
    allVats.push({
      ...product,
      ttba_vatno: v,
      TTBA_qty_per_Vat: Math.ceil(product.ttba_qty / product.TTBA_VATQTY),
    });
  }

  return allVats;
}

export async function fetchCekRackDetailMock({ noAnalisa, ttbaNo, seqId }) {
  await wait();

  const stockData = GUDANG_STOCK_DETAIL[noAnalisa];
  if (!stockData) {
    return {
      gudangUtama: [],
      gudangKecil: [],
      gudangSampling: [],
    };
  }

  return stockData;
}

// ─────── UseBahanKemas2 mock data ──────────────────────────────────────────

const USE_BK_BON_LIST = [
  {
    MR_No: "00055/II/24/PN1/MR",
    MR_SeqID: 1,
    MR_ItemID: "A 228",
    Product_Name: "ALUFOIL BLISTER",
    MR_BatchNo: "BK-BATCH-001",
    MR_DNcQTY: 1,
    MR_DNcNo: "DNC-BK-0107",
    MR_ItemUnit: "kg",
  },
  {
    MR_No: "00055/II/24/PN1/MR",
    MR_SeqID: 2,
    MR_ItemID: "A 229",
    Product_Name: "PVC SHEET",
    MR_BatchNo: "BK-BATCH-002",
    MR_DNcQTY: 0.5,
    MR_DNcNo: "DNC-BK-0108",
    MR_ItemUnit: "kg",
  },
  {
    MR_No: "00078/III/24/PN3/MR",
    MR_SeqID: 1,
    MR_ItemID: "A 300",
    Product_Name: "LABEL ROLL",
    MR_BatchNo: "BK-BATCH-003",
    MR_DNcQTY: 300,
    MR_DNcNo: "DNC-BK-0110",
    MR_ItemUnit: "pcs",
  },
];

const USE_BK_VATS_BY_BON = {
  "00055/II/24/PN1/MR|1|A 228|DNC-BK-0107": [
    {
      Lokasi: "BK2",
      Rak: "K1",
      Baris: "1",
      Kolom: "1",
      DNc_No: "DNC-BK-0107",
      Item_ID: "A 228",
      Item_Name: "ALUFOIL BLISTER",
      Qty: 400,
      DNc_TTBANo: "BK/2026/010#7#1",
    },
    {
      Lokasi: "BK2",
      Rak: "K1",
      Baris: "1",
      Kolom: "2",
      DNc_No: "DNC-BK-0107",
      Item_ID: "A 228",
      Item_Name: "ALUFOIL BLISTER",
      Qty: 350,
      DNc_TTBANo: "BK/2026/010#7#2",
    },
    {
      Lokasi: "AF2",
      Rak: "A1",
      Baris: "1",
      Kolom: "1",
      DNc_No: "DNC-BK-0107",
      Item_ID: "A 228",
      Item_Name: "ALUFOIL BLISTER",
      Qty: 500,
      DNc_TTBANo: "BK/2026/010#7#3",
    },
  ],
  "00055/II/24/PN1/MR|2|A 229|DNC-BK-0108": [
    {
      Lokasi: "BK2",
      Rak: "K2",
      Baris: "1",
      Kolom: "1",
      DNc_No: "DNC-BK-0108",
      Item_ID: "A 229",
      Item_Name: "PVC SHEET",
      Qty: 250,
      DNc_TTBANo: "BK/2026/011#5#1",
    },
    {
      Lokasi: "BK2",
      Rak: "K2",
      Baris: "1",
      Kolom: "2",
      DNc_No: "DNC-BK-0108",
      Item_ID: "A 229",
      Item_Name: "PVC SHEET",
      Qty: 250,
      DNc_TTBANo: "BK/2026/011#5#2",
    },
  ],
  "00078/III/24/PN3/MR|1|A 300|DNC-BK-0110": [
    {
      Lokasi: "BK2",
      Rak: "K3",
      Baris: "1",
      Kolom: "1",
      DNc_No: "DNC-BK-0110",
      Item_ID: "A 300",
      Item_Name: "LABEL ROLL",
      Qty: 150,
      DNc_TTBANo: "BK/2026/050#1#1",
    },
    {
      Lokasi: "BK2",
      Rak: "K3",
      Baris: "1",
      Kolom: "2",
      DNc_No: "DNC-BK-0110",
      Item_ID: "A 300",
      Item_Name: "LABEL ROLL",
      Qty: 150,
      DNc_TTBANo: "BK/2026/050#1#2",
    },
  ],
};

const USE_BK_WITHDRAWAL_RECORDS = [];

function makeUseBkKey(mrNo, mrSeqId, itemId, dncNo) {
  return `${mrNo}|${mrSeqId}|${itemId}|${dncNo}`;
}

function findUseBkBon(mrNo, mrSeqId, itemId, dncNo) {
  return USE_BK_BON_LIST.find(
    (row) =>
      row.MR_No === mrNo &&
      Number(row.MR_SeqID) === Number(mrSeqId) &&
      row.MR_ItemID === itemId &&
      row.MR_DNcNo === dncNo
  );
}

export async function fetchBonKeluarUseBKMock(searchTerm) {
  await wait();

  const keyword = String(searchTerm || "").toLowerCase();
  const result = USE_BK_BON_LIST.filter((row) =>
    String(row.MR_BatchNo || "").toLowerCase().includes(keyword)
  );

  if (result.length === 0) {
    const error = new Error("Data bon tidak ditemukan");
    error.response = { data: { message: "Data bon tidak ditemukan" } };
    throw error;
  }

  return result;
}

export async function fetchBonKeluarUseBKByMRMock(searchTerm) {
  await wait();

  const keyword = String(searchTerm || "").toLowerCase();
  const result = USE_BK_BON_LIST.filter((row) =>
    String(row.MR_No || "").toLowerCase().includes(keyword)
  );

  if (result.length === 0) {
    const error = new Error("Data bon tidak ditemukan");
    error.response = { data: { message: "Data bon tidak ditemukan" } };
    throw error;
  }

  return result;
}

export async function fetchDetailVatFromBonMock({
  formatedItemId,
  formatedMR_NoAnalisa,
  MrNo,
  MrSeqId,
}) {
  await wait();

  const key = makeUseBkKey(MrNo, MrSeqId, formatedItemId, formatedMR_NoAnalisa);
  const vats = USE_BK_VATS_BY_BON[key] || [];

  if (vats.length === 0) {
    const error = new Error("No Item untuk ditimbang");
    error.response = { data: { message: "No Item untuk ditimbang" } };
    throw error;
  }

  return vats;
}

export async function createPpicListManualBKMock({ selectedVats, selectedItem }) {
  await wait();

  if (!Array.isArray(selectedVats) || selectedVats.length === 0) {
    const error = new Error("Belum ada vat yang dipilih");
    error.response = { data: { message: "Belum ada vat yang dipilih" } };
    throw error;
  }

  const bon = findUseBkBon(
    selectedItem?.MR_No,
    selectedItem?.MR_SeqID,
    selectedItem?.MR_ItemID,
    selectedItem?.MR_NoAnalisa
  );

  if (!bon) {
    const error = new Error("Data bon tidak ditemukan");
    error.response = { data: { message: "Data bon tidak ditemukan" } };
    throw error;
  }

  const requested =
    String(selectedItem?.MR_ItemUnit || "").toLowerCase() === "kg"
      ? Number(selectedItem?.MR_DNcQTY || 0) * 1000
      : Number(selectedItem?.MR_DNcQTY || 0);
  const totalSelected = selectedVats.reduce((sum, item) => sum + Number(item?.Qty || 0), 0);

  if (Number(totalSelected.toFixed(3)) !== Number(requested.toFixed(3))) {
    const error = new Error("Jumlah penarikan belum sesuai dengan MR");
    error.response = { data: { message: "Jumlah penarikan belum sesuai dengan MR" } };
    throw error;
  }

  const key = makeUseBkKey(
    selectedItem?.MR_No,
    selectedItem?.MR_SeqID,
    selectedItem?.MR_ItemID,
    selectedItem?.MR_NoAnalisa
  );
  const vats = USE_BK_VATS_BY_BON[key] || [];

  for (const selected of selectedVats) {
    const target = vats.find((row) => row.DNc_TTBANo === selected.DNc_TTBANo);
    if (!target) {
      const error = new Error(`Vat ${selected.DNc_TTBANo} tidak ditemukan`);
      error.response = { data: { message: `Vat ${selected.DNc_TTBANo} tidak ditemukan` } };
      throw error;
    }

    if (Number(target.Qty) < Number(selected.Qty)) {
      const error = new Error(`Qty vat ${selected.DNc_TTBANo} tidak mencukupi`);
      error.response = { data: { message: `Qty vat ${selected.DNc_TTBANo} tidak mencukupi` } };
      throw error;
    }

    target.Qty = Number((Number(target.Qty) - Number(selected.Qty)).toFixed(3));
  }

  const now = new Date().toISOString();
  for (const selected of selectedVats) {
    USE_BK_WITHDRAWAL_RECORDS.push({
      MR_No: selectedItem?.MR_No,
      MR_SeqID: selectedItem?.MR_SeqID,
      MR_ItemID: selectedItem?.MR_ItemID,
      MR_DNcNo: selectedItem?.MR_NoAnalisa,
      Process_Date: now,
      No_VAT: selected.No_Vat,
      Nett_Gram: selected.Qty,
      DNc_TTBANo: selected.DNc_TTBANo,
      type: "BK",
      sourceKey: key,
    });
  }

  return { message: "Bahan berhasil ditarik untuk produksi" };
}

export async function getListTimbangManualBatalScanMock({ type, mr_no, dnc_no }) {
  await wait();

  const result = USE_BK_WITHDRAWAL_RECORDS.filter((row) => {
    const matchType = String(row.type || "") === String(type || "");
    const matchMr = String(row.MR_No || "").toLowerCase().includes(String(mr_no || "").toLowerCase());
    const matchDnc = String(row.MR_DNcNo || "").toLowerCase().includes(String(dnc_no || "").toLowerCase());
    return matchType && matchMr && matchDnc;
  });

  return result;
}

export async function undoWithdrawPpicBkMock(checkedData) {
  await wait();

  const toUndo = USE_BK_WITHDRAWAL_RECORDS.filter(
    (row) =>
      row.MR_No === checkedData?.MR_No &&
      Number(row.MR_SeqID) === Number(checkedData?.MR_SeqID) &&
      row.MR_ItemID === checkedData?.MR_ItemID &&
      row.MR_DNcNo === checkedData?.MR_DNcNo &&
      row.type === checkedData?.type
  );

  if (toUndo.length === 0) {
    const error = new Error("Data withdrawal tidak ditemukan");
    error.response = { data: { message: "Data withdrawal tidak ditemukan" } };
    throw error;
  }

  for (const row of toUndo) {
    const vats = USE_BK_VATS_BY_BON[row.sourceKey] || [];
    const vat = vats.find((v) => v.DNc_TTBANo === row.DNc_TTBANo);
    if (vat) {
      vat.Qty = Number((Number(vat.Qty) + Number(row.Nett_Gram)).toFixed(3));
    }
  }

  for (let i = USE_BK_WITHDRAWAL_RECORDS.length - 1; i >= 0; i--) {
    const row = USE_BK_WITHDRAWAL_RECORDS[i];
    const isTarget =
      row.MR_No === checkedData?.MR_No &&
      Number(row.MR_SeqID) === Number(checkedData?.MR_SeqID) &&
      row.MR_ItemID === checkedData?.MR_ItemID &&
      row.MR_DNcNo === checkedData?.MR_DNcNo &&
      row.type === checkedData?.type;
    if (isTarget) {
      USE_BK_WITHDRAWAL_RECORDS.splice(i, 1);
    }
  }

  return { message: "Undo berhasil" };
}
