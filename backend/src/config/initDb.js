const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./env');

async function runInitDatabase() {
  console.log('====================================================');
  console.log('🚀 INITIALIZING CANONICAL DATABASE (SCHEMA + SEED)');
  console.log('====================================================\n');

  let connection;
  try {
    // 1. Kết nối MySQL server không chỉ định database trước (để tạo DB nếu chưa có)
    connection = await mysql.createConnection({
      host: config.DB.HOST,
      port: config.DB.PORT,
      user: config.DB.USER,
      password: config.DB.PASSWORD,
      multipleStatements: true,
    });

    console.log(`✓ Kết nối MySQL server (${config.DB.HOST}:${config.DB.PORT}) thành công!`);

    // 2. Tự động sinh file seed.sql với 500+ bản ghi chuẩn trước khi nạp
    console.log('1. Đang tự động tạo dữ liệu mẫu phong phú (500+ bản ghi/bảng)...');
    try {
      require('./generateSeed');
    } catch (genErr) {
      console.warn('Lưu ý khi tạo seed:', genErr.message);
    }

    // 3. Đọc file database/schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Không tìm thấy file schema tại: ${schemaPath}`);
    }
    console.log('2. Đang nạp cấu trúc bảng từ database/schema.sql...');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Chuyển đổi DELIMITER // thành định dạng MySQL client chuẩn
    schemaSql = schemaSql.replace(/DELIMITER \/\//g, '').replace(/DELIMITER ;/g, '').replace(/\/\/\s*$/gm, ';');
    await connection.query(schemaSql);
    console.log('   ✓ Tạo Database & Bảng chuẩn (properties, bookings, wallets, ...) thành công!');

    // 4. Đọc file database/seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Không tìm thấy file seed tại: ${seedPath}`);
    }
    console.log('3. Đang chèn dữ liệu mẫu chuẩn (500+ bản ghi) từ database/seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Tách câu lệnh theo từng bảng để không bị vượt giới hạn max_allowed_packet của MySQL
    const statements = seedSql
      .split(/;\s*[\r\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        await connection.query(stmt);
      }
    }
    console.log('   ✓ Chèn 520 users, 520 properties, 3120 ảnh, 3600+ tiện nghi, 520 đơn phòng, 520 ví thành công!');

    // 4. Kiểm tra tổng kết
    const [pRows] = await connection.query('SELECT COUNT(*) AS total FROM homestay_db.properties');
    const [imgRows] = await connection.query('SELECT COUNT(*) AS total FROM homestay_db.property_images');
    const [bRows] = await connection.query('SELECT COUNT(*) AS total FROM homestay_db.bookings');
    console.log('\n====================================================');
    console.log('🎉 KHỞI TẠO CSDL THÀNH CÔNG VỚI SINGLE SOURCE OF TRUTH!');
    console.log(`   - Tổng số chỗ nghỉ (properties) : ${pRows[0].total}`);
    console.log(`   - Tổng số ảnh (property_images)  : ${imgRows[0].total}`);
    console.log(`   - Tổng số đơn phòng (bookings)   : ${bRows[0].total}`);
    console.log('====================================================');

  } catch (err) {
    console.error('\n❌ Lỗi khi khởi tạo database:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('👉 GỢI Ý: Vui lòng bật XAMPP / MariaDB / MySQL Server trên máy tính trước khi chạy lệnh này.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runInitDatabase();
