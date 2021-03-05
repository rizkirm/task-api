CREATE DATABASE db_monitoring_task;

CREATE TABLE m_employee(
    id SERIAL PRIMARY KEY,
    nik INTEGER,
    name VARCHAR(30),
    phone VARCHAR
);

CREATE TABLE m_issue(
    id_issue SERIAL PRIMARY KEY,
    id_employee SERIAL,
    category VARCHAR,
    descriptiom VARCHAR,
    date timestamp not null default CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee
        FOREIGN KEY(id_employee)
            REFERENCES m_employee(id_employee)
            ON DELETE SET NULL
);

create table m_employee (
employee_id serial primary key,
employee_name varchar(50) not null,
employee_phone varchar(20) not null,
employee_address varchar(100) not null,
employee_email varchar(30) not null,
created_at timestamp not null,
updated_at timestamp
);

create table m_category_issue (
    category_issue_id serial primary key,
    category_issue_name varchar(20) not null,
    category_issue_desc varchar(255) not null,
    created_at timestamp not null,
    updated_at timestamp
    );

create table m_issue (
    issue_id serial not null,
    category_issue_id serial not null,
    issue_name varchar(30),
    issue_desc varchar(255),
    issue_upload varchar(255),
    created_at timestamp,
    updated_at timestamp,
    primary key (issue_id),
    foreign key (category_issue_id)
        references m_category_issue (category_issue_id)
);

create table m_solve_issue (
    solve_issue_id serial not null,
    issue_id serial not null,
    employee_id serial not null,
    solve_issue_desc varchar(255),
    solve_issue_time varchar(100),
    created_at timestamp,
    updated_at timestamp,
    primary key (solve_issue_id),
    foreign key (issue_id) references m_issue (issue_id),
    foreign key (employee_id) references m_employee (employee_id)
);

insert into m_employee (employee_name, employee_phone, employee_address, employee_email, created_at)
values ('rizki', '087715233531', 'bekasi', 'rizkimuntohary@gmail.com',NOW());

insert into m_category_issue (category_issue_name, category_issue_desc, created_at)
values ('bug software', '...', NOW());

    ALTER TABLE public.m_issue ADD CONSTRAINT m_category_issue_foreign FOREIGN KEY (category_issue_id) REFERENCES m_category_issue(category_issue_id) ON UPDATE CASCADE ON DELETE CASCADE

    UPDATE m_employee SET employee_name = 'rizki', employee_phone = '081281090442', employee_address = 'Bekasi', employee_email = 'rizki@gmail.com', updated_at = NOW() WHERE employee_id = 104610589