using Microsoft.AspNetCore.Mvc;
using InterviewApi.Models;
using InterviewApi.Services;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitationController : ControllerBase
{
    private readonly IVisitationService _visitationService;
    private readonly ICustomerService _customerService;
    private readonly IHotelService _hotelService;

    public VisitationController(
        IVisitationService visitationService,
        ICustomerService customerService,
        IHotelService hotelService)
    {
        _visitationService = visitationService;
        _customerService = customerService;
        _hotelService = hotelService;
    }

    /// <summary>GET /api/visitation?hotelIds=1,2&month=1&year=2024&onlyLoyal=false</summary>
    [HttpGet]
    public ActionResult<List<VisitationResponse>> GetVisitations(
        [FromQuery] string? hotelIds,
        [FromQuery] int? month,
        [FromQuery] int? year,
        [FromQuery] bool onlyLoyal = false)
    {
        var parsedHotelIds = hotelIds?
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s.Trim(), out var id) ? (int?)id : null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList();

        var visitations = _visitationService.GetFiltered(parsedHotelIds, month, year);

        if (onlyLoyal)
        {
            var loyalIds = _customerService
                .GetLoyalCustomerIds(_visitationService.GetAll())
                .ToHashSet();
            visitations = visitations.Where(v => loyalIds.Contains(v.CustomerId)).ToList();
        }

        var customers = _customerService.GetAll().ToDictionary(c => c.Id);
        var hotels = _hotelService.GetAll().ToDictionary(h => h.Id);

        var result = visitations.Select(v => new VisitationResponse
        {
            Id = v.Id,
            CustomerId = v.CustomerId,
            CustomerName = customers.TryGetValue(v.CustomerId, out var c) ? c.Name : "Unknown",
            HotelId = v.HotelId,
            HotelName = hotels.TryGetValue(v.HotelId, out var h) ? h.Name : "Unknown",
            VisitDate = v.VisitDate
        }).ToList();

        return Ok(result);
    }

    /// <summary>POST /api/visitation — Register a new visit</summary>
    [HttpPost]
    public ActionResult<VisitationResponse> RegisterVisit([FromBody] RegisterVisitRequest request)
    {
        if (request.CustomerId <= 0)
            return BadRequest(new { error = "Valid customerId is required." });
        if (request.HotelId <= 0)
            return BadRequest(new { error = "Valid hotelId is required." });
        if (request.VisitDate == default)
            return BadRequest(new { error = "visitDate is required." });

        var customer = _customerService.GetById(request.CustomerId);
        if (customer is null)
            return BadRequest(new { error = $"Customer {request.CustomerId} not found." });

        var hotel = _hotelService.GetById(request.HotelId);
        if (hotel is null)
            return BadRequest(new { error = $"Hotel {request.HotelId} not found." });

        var visitation = _visitationService.Add(request.CustomerId, request.HotelId, request.VisitDate);

        return Ok(new VisitationResponse
        {
            Id = visitation.Id,
            CustomerId = visitation.CustomerId,
            CustomerName = customer.Name,
            HotelId = visitation.HotelId,
            HotelName = hotel.Name,
            VisitDate = visitation.VisitDate
        });
    }

    /// <summary>GET /api/visitation/customer/{customerId} — All visits for a specific customer</summary>
    [HttpGet("customer/{customerId:int}")]
    public ActionResult<List<VisitationResponse>> GetByCustomer(int customerId)
    {
        var customer = _customerService.GetById(customerId);
        if (customer is null)
            return NotFound(new { error = $"Customer {customerId} not found." });

        var hotels = _hotelService.GetAll().ToDictionary(h => h.Id);

        var visitations = _visitationService.GetAll()
            .Where(v => v.CustomerId == customerId)
            .OrderByDescending(v => v.VisitDate)
            .Select(v => new VisitationResponse
            {
                Id = v.Id,
                CustomerId = v.CustomerId,
                CustomerName = customer.Name,
                HotelId = v.HotelId,
                HotelName = hotels.TryGetValue(v.HotelId, out var h) ? h.Name : "Unknown",
                VisitDate = v.VisitDate
            })
            .ToList();

        return Ok(visitations);
    }
}
