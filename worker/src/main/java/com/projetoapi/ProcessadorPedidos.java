package com.projetoapi;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import org.jboss.logging.Logger;

@ApplicationScoped
public class ProcessadorPedidos {

    private static final Logger LOG = Logger.getLogger(ProcessadorPedidos.class);

    @Inject
    DataSource dataSource;

    @Scheduled(every = "60s")
    public void processarPedidosPendentes() {
        LOG.info("Iniciando processamento de pedidos pendentes...");

        String buscar = """
            SELECT id FROM pedidos
            WHERE status = 'pending'
            AND created_at < NOW() - INTERVAL '10 minutes'
        """;

        String atualizar = """
            UPDATE pedidos SET status = 'confirmed'
            WHERE id = ?::uuid
        """;

        try (Connection conn = dataSource.getConnection()) {
            ResultSet rs = conn.createStatement().executeQuery(buscar);

            while (rs.next()) {
                String id = rs.getString("id");

                try (PreparedStatement ps = conn.prepareStatement(atualizar)) {
                    ps.setString(1, id);
                    ps.executeUpdate();
                    LOG.infof("Pedido confirmado: %s às %s", id, LocalDateTime.now());
                }
            }

        } catch (Exception e) {
            LOG.errorf("Erro ao processar pedidos: %s", e.getMessage());
        }
    }
}