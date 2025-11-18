/*
 * file: backend/src/main/java/com/company/ptsm/service/CommunicationService.java
 *
 * [MỚI]
 * Service này xử lý các nghiệp vụ Giao tiếp (Communication).
 * (VAI TRÒ 2 & 3: Thông báo, Khiếu nại, Khảo sát).
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.communication.*;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.model.enums.Role;
import com.company.ptsm.repository.AnnouncementRepository;
import com.company.ptsm.repository.ComplaintRepository;
import com.company.ptsm.repository.PollRepository;
import com.company.ptsm.repository.PollVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private final AnnouncementRepository announcementRepository;
    private final ComplaintRepository complaintRepository;
    private final PollRepository pollRepository;
    private final PollVoteRepository pollVoteRepository;

    // --- Logic cho Thông báo (Announcements) ---

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementDto dto, User author) {
        Branch branch = null;
        if (author.getRole() == Role.ROLE_MANAGER) {
            branch = author.getBranch(); // Manager chỉ tạo cho cơ sở của mình
        }
        // (Nếu Role là SUPER_ADMIN, 'branch' sẽ là null -> thông báo chung)

        Announcement announcement = Announcement.builder()
                .author(author)
                .branch(branch)
                .title(dto.getTitle())
                .content(dto.getContent())
                .build();

        Announcement saved = announcementRepository.save(announcement);
        return mapToAnnouncementDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncements(User user) {
        List<Announcement> announcements;
        if (user.getRole() == Role.ROLE_SUPER_ADMIN) {
            announcements = announcementRepository.findAllByOrderByCreatedAtDesc();
        } else {
            // Staff/Manager thấy thông báo của cơ sở MÌNH + thông báo CHUNG
            announcements = announcementRepository.findAnnouncementsForBranch(user.getBranch().getId());
        }

        return announcements.stream()
                .map(this::mapToAnnouncementDto)
                .collect(Collectors.toList());
    }

    // --- Logic cho Khiếu nại (Complaints) ---

    @Transactional
    public ComplaintDto createComplaint(ComplaintDto dto, User staff) {
        Complaint complaint = Complaint.builder()
                .staffUser(staff)
                .branch(staff.getBranch())
                .content(dto.getContent())
                .status("SUBMITTED")
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return mapToComplaintDto(saved, true); // (true = ẩn tên Staff)
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getMyComplaints(User staff) {
        return complaintRepository.findByStaffUserIdOrderByCreatedAtDesc(staff.getId())
                .stream()
                .map(c -> mapToComplaintDto(c, false)) // (false = hiện tên Staff)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsForBranch(User manager) {
        return complaintRepository.findByBranchIdOrderByCreatedAtDesc(manager.getBranch().getId())
                .stream()
                .map(c -> mapToComplaintDto(c, false)) // (Manager được xem tên)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintDto respondToComplaint(Integer complaintId, ComplaintResponseDto dto, User manager) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khiếu nại."));

        if (!complaint.getBranch().getId().equals(manager.getBranch().getId())) {
            throw new BusinessRuleException("Không có quyền phản hồi khiếu nại của cơ sở khác.");
        }

        complaint.setResponse(dto.getResponse());
        complaint.setStatus("RESOLVED");

        Complaint saved = complaintRepository.save(complaint);
        return mapToComplaintDto(saved, false);
    }

    // --- [MỚI] Logic cho Khảo sát (Polls) ---

    @Transactional
    public Poll createPoll(PollDto dto, User manager) {
        Poll poll = Poll.builder()
                .author(manager)
                .branch(manager.getBranch())
                .question(dto.getQuestion())
                .options(dto.getOptions())
                .build();
        return pollRepository.save(poll);
    }

    @Transactional(readOnly = true)
    public List<Poll> getActivePolls(User staff) {
        return pollRepository.findByBranchIdAndIsActiveTrueOrderByCreatedAtDesc(staff.getBranch().getId());
    }

    @Transactional
    public void voteOnPoll(Integer pollId, PollVoteDto dto, User staff) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khảo sát."));

        // (Kiểm tra xem vote có hợp lệ không, đã vote chưa...
        // schema.sql đã có UNIQUE constraint để chặn vote 2 lần)

        PollVote vote = PollVote.builder()
                .poll(poll)
                .user(staff)
                .selectedOption(dto.getSelectedOption())
                .build();

        pollVoteRepository.save(vote);
    }

    // --- Hàm tiện ích (Helpers) ---

    private AnnouncementDto mapToAnnouncementDto(Announcement entity) {
        String authorName = "Hệ thống";
        if (entity.getAuthor() != null) {
            authorName = entity.getAuthor().getStaffProfile() != null
                    ? entity.getAuthor().getStaffProfile().getFullName()
                    : entity.getAuthor().getEmail();
        }

        return AnnouncementDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .authorName(authorName)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private ComplaintDto mapToComplaintDto(Complaint entity, boolean isAnonymous) {
        String staffName = "Giấu tên";
        if (!isAnonymous && entity.getStaffUser().getStaffProfile() != null) {
            staffName = entity.getStaffUser().getStaffProfile().getFullName();
        }

        return ComplaintDto.builder()
                .id(entity.getId())
                .staffUserId(isAnonymous ? null : entity.getStaffUser().getId())
                .staffName(staffName)
                .content(entity.getContent())
                .response(entity.getResponse())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}