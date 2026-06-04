package com.cipher.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** BaseEntity 의 @CreatedDate/@LastModifiedDate 자동 채움 활성화. */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
