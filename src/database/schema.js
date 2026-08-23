// @file src/db/schema.js
export const schema = {
    users: {
        lid: "VARCHAR(100) PRIMARY KEY",
        nama: "VARCHAR(100) NOT NULL",
        userid: "VARCHAR(100) NOT NULL",
        email: "VARCHAR(100) NOT NULL UNIQUE",
        password: "VARCHAR(255) NOT NULL",
        verification_code: "VARCHAR(7) NULL",
        verification_expires_at: "TIMESTAMP NULL",
        is_verified: "BOOLEAN DEFAULT FALSE",
        daily_limit: "INT DEFAULT 0",
        purchase_limit: "INT DEFAULT 0",
        premium: "BOOLEAN DEFAULT FALSE",
        premium_reset_date: "TIMESTAMP NULL",
        created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    },
  
    deposits: {
        deposit_id: "VARCHAR(100) PRIMARY KEY",
        lid: "VARCHAR(100) NOT NULL",
        item: "VARCHAR(20) NOT NULL DEFAULT 'limit'",
        status: "VARCHAR(20) NOT NULL DEFAULT 'pending'",
        amount: "INT NOT NULL",
        unique_code: "INT NOT NULL",
        total_amount: "INT NOT NULL",
        qr_image: "TEXT",
        qr_string: "TEXT",
        expired_at: "DATETIME NOT NULL",
        created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    },

    wa_groups: {
        lid: "VARCHAR(100) PRIMARY KEY"
    },
    
    bot_data: {
        id: "TINYINT PRIMARY KEY DEFAULT 1",
        last_limit_reset: "DATE NULL"
    },
    
    bot_command: {
        command: "VARCHAR(100) NOT NULL UNIQUE",
        type: "VARCHAR(50) NOT NULL",
        total_access: "INT NOT NULL DEFAULT 0"
    },
    
    rpg_players: {
        lid: "VARCHAR(100) PRIMARY KEY",
    
        level: "INT DEFAULT 1",
        exp: "INT DEFAULT 0",
    
        hp: "INT NOT NULL",
        max_hp: "INT NOT NULL",
    
        stamina: "INT NOT NULL",
        max_stamina: "INT NOT NULL",
    
        attack: "INT NOT NULL",
        defense: "INT NOT NULL",
    
        gold: "INT DEFAULT 0",
    
        current_map: "VARCHAR(100) DEFAULT 'forest'",
    
        scanner_level: "INT DEFAULT 0",
    
        last_stamina_regen: "BIGINT NOT NULL DEFAULT 0",
    
        created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    },

    rpg_battles: {

        lid: "VARCHAR(100) PRIMARY KEY",
    
        monster_id: "VARCHAR(100) NOT NULL",
    
        monster_name: "VARCHAR(100) NOT NULL",
        monster_icon: "VARCHAR(20) NOT NULL",
    
        monster_level: "INT NOT NULL",
        monster_power: "INT NOT NULL",
    
        monster_hp: "INT NOT NULL",
        monster_max_hp: "INT NOT NULL",
    
        monster_attack: "INT NOT NULL",
        monster_defense: "INT NOT NULL",
        monster_speed: "INT NOT NULL",
    
        round: "INT DEFAULT 1",
    
        created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    
    },
    
    rpg_recoveries: {
        lid: "VARCHAR(100) PRIMARY KEY",
    
        type: "VARCHAR(50) NOT NULL",
    
        target_hp: "INT NOT NULL",
    
        started_at: "BIGINT NOT NULL",
    
        finish_at: "BIGINT NOT NULL",
    
        created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    },
    
    rpg_inventory: {
        lid: "VARCHAR(100) NOT NULL",
        item_id: "VARCHAR(100) NOT NULL",
        quantity: "INT DEFAULT 1",
    
        created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    
        PRIMARY: "PRIMARY KEY (lid, item_id)"
    },
};