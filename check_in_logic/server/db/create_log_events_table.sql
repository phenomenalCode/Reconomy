CREATE TABLE `log_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date_time` varchar(45) DEFAULT NULL,
  `event_type` int DEFAULT NULL,
  `comment` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `emp_no_idx` (`user_id`),
  CONSTRAINT `emp_no` FOREIGN KEY (`user_id`) REFERENCES `employees` (`emp_no`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci