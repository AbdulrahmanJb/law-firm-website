using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/consultations")]
public class ConsultationsController(LawFirmDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateConsultationRequest request)
    {
        var consultation = new ConsultationRequest
        {
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email.Trim(),
            ServiceType = request.ServiceType.Trim(),
            Message = request.Message.Trim()
        };

        dbContext.ConsultationRequests.Add(consultation);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Create), new { consultation.Id }, consultation);
    }
}

public record CreateConsultationRequest(string FullName, string Phone, string Email, string ServiceType, string Message);
