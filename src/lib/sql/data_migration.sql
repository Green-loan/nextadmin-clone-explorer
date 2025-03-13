
-- Sample data migration statements to populate the tables with existing data
-- NOTE: These are examples and would need to be adjusted with actual data in a production environment

-- Populate users_account table 
INSERT INTO users_account (id, full_names, email, password, phone, id_number, gender, date_of_birth, home_address, province, confirmed)
VALUES 
(gen_random_uuid(), 'Malape Mahlogonolo', 'malapemahlogonolo@gmail.com', '13140', '0683387040', '9911170477086', 'Female', '1999-11-17', '13140 Ext 13 soshanguve south', 'Gauteng', true),
(gen_random_uuid(), 'Zandile patience nyathi', 'zandilepatience97@gmail.com', 'Zandi@22', '0824219367', '0309011353088', 'Female', '2003-09-01', '1360', 'Mpumalanga', true),
(gen_random_uuid(), 'Green Loan (ADMIN)', 'greenservice.loan@gmail.com', 'greenservice@1999', '0640519593', '0000000000000', 'Male', '1999-07-08', 'Online', 'Gauteng', true);

-- Populate approved_loans table (sample entries)
INSERT INTO approved_loans (id, name, email, phone, id_number, gender, dob, address, amount, bank, account_number, purpose, due_date, status, timestamp)
VALUES 
(gen_random_uuid(), 'Cassius Rhulani', 'rhulanicassiusbaloyi@gmail.com', '0714346600', '9711125742083', 'male', '1997-11-12', 'Malamulele P.O Box 0982', 500.00, 'nedbank', '1284520935', 'personal', '2025-01-31', true, '2025-01-07T08:35:08.368Z'),
(gen_random_uuid(), 'Hulisani', '+27 79 615 1876', '+27 79 615 1876', '00000', 'male', '1999-12-09', 'Pretoria', 1150.00, 'capitec', '+27 79 615 1876', 'personal', '2025-01-25', true, '2025-01-18T21:51:01.973Z');

-- Populate stokvela_members table (sample entries)
INSERT INTO stokvela_members (id, full_name, email, cellphone, date_of_birth, account_name, account_number, amount_paid, amount_to_receive, receiving_date, user_number)
VALUES 
(gen_random_uuid(), 'Thalitha Mhlongo', 'mhlongothalitha09@gmail.com', '+27 72 043 5466', '1999-06-10', 'Capitec', '1615507920', 0, 2000, '2025-04-01', '#1'),
(gen_random_uuid(), 'Nhlalala Sibuyi', 'nhlalalanhlanhla@gmail.com', '0790659870', '2002-10-15', 'Standard bank', '10165146492', 0, 0, '2025-05-01', '#2');

-- Populate backend_users table (sample entries)
INSERT INTO backend_users (id, email, full_name, password, is_confirmed)
VALUES 
(gen_random_uuid(), 'clintosope48p@gmail.com', 'Clinton Bongani Khoza', '111111111', true),
(gen_random_uuid(), 'clintonbonganikhoza@gmail.com', 'Clinton Bongani Khoza', 'greenservice@1999', true);

-- Populate investments table (sample entries)
INSERT INTO investments (id, full_name, id_number, address, bank, account_number, amount_investing, amount_to_receive, investment_period, is_active, is_confirmed, timestamp)
VALUES 
(gen_random_uuid(), 'Green Loan (ADMIN)', '99907085796081', '39 troy street', 'Standard Bank', '10197101966', 150.00, 420.00, 2, false, false, '2025-02-13T08:48:34.177Z'),
(gen_random_uuid(), 'Clinton Bongani Khoza', '99907085796081', '39 troy street', 'Capitec', '10197101966   (Standard bank)   account holder', 200.00, 560.00, 2, false, false, '2025-02-13T10:16:36.240Z');
