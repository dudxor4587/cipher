package com.cipher.notification.domain.repository;

import com.cipher.notification.domain.PushSubscription;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {

    List<PushSubscription> findAllByUserId(UUID userId);

    void deleteByEndpoint(String endpoint);

    @Modifying
    @Query(value = """
            INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at, updated_at)
            VALUES (:id, :userId, :endpoint, :p256dh, :auth, NOW(), NOW())
            ON CONFLICT (endpoint) DO UPDATE
              SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, updated_at = NOW()
            """, nativeQuery = true)
    void upsert(@Param("id") UUID id, @Param("userId") UUID userId,
                @Param("endpoint") String endpoint, @Param("p256dh") String p256dh,
                @Param("auth") String auth);
}
