package com.example.chinook.repository;

import com.example.chinook.entity.InvoiceItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    
    List<InvoiceItem> findByInvoiceId(Long invoiceId);
    
    List<InvoiceItem> findByTrackId(Long trackId);
    
    @Query("SELECT ii FROM InvoiceItem ii " +
           "JOIN FETCH ii.track t " +
           "JOIN FETCH t.album a " +
           "JOIN FETCH a.artist " +
           "WHERE ii.invoice.id = :invoiceId")
    List<InvoiceItem> findByInvoiceIdWithDetails(@Param("invoiceId") Long invoiceId);
    
    @Query("SELECT ii.track.id, SUM(ii.quantity) as totalSold " +
           "FROM InvoiceItem ii " +
           "GROUP BY ii.track.id " +
           "ORDER BY totalSold DESC")
    Page<Object[]> findTopSellingTracks(Pageable pageable);
    
    @Query("SELECT ii.track.genre.id, SUM(ii.quantity) as totalSold " +
           "FROM InvoiceItem ii " +
           "GROUP BY ii.track.genre.id " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingGenres();
}
