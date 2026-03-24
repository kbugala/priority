using Microsoft.AspNetCore.Mvc;
using InterviewApi.Models;
using InterviewApi.Services;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly IVisitationService _visitationService;

    public CustomerController(ICustomerService customerService, IVisitationService visitationService)
    {
        _customerService = customerService;
        _visitationService = visitationService;
    }

    [HttpGet("welcome")]
    public ActionResult<object> Welcome() => Ok(new
    {
        message = "Welcome to Priority Customer Management API!",
        version = "1.0.0",
        endpoints = new[]
        {
            "GET  /api/customer/welcome",
            "POST /api/customer",
            "GET  /api/customer/{id}",
            "GET  /api/customer/loyal?date=YYYY-MM-DD",
            "POST /api/customer/register"
        }
    });

    /// <summary>GET /api/customer/all — List all customers</summary>
    [HttpGet("all")]
    public ActionResult<List<Customer>> GetAllCustomers()
        => Ok(_customerService.GetAll());

    /// <summary>POST /api/customer — Add a new customer</summary>
    [HttpPost]
    public ActionResult<Customer> AddCustomer([FromBody] CreateCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required." });
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { error = "Email is required." });

        var customer = _customerService.Add(request.Name, request.Email);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    /// <summary>GET /api/customer/{id} — Get a customer by ID</summary>
    [HttpGet("{id:int}")]
    public ActionResult<Customer> GetCustomer(int id)
    {
        var customer = _customerService.GetById(id);
        if (customer is null) return NotFound(new { error = $"Customer {id} not found." });
        return Ok(customer);
    }

    /// <summary>GET /api/customer/loyal?date=YYYY-MM-DD — Loyal = same hotel, same weekday, every week of a calendar month</summary>
    [HttpGet("loyal")]
    public ActionResult<List<Customer>> GetLoyalCustomers([FromQuery] DateTime? date)
    {
        var cutoff = date.HasValue
            ? DateTime.SpecifyKind(date.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var loyalIds = _customerService.GetLoyalCustomerIds(_visitationService.GetAll(), cutoff).ToHashSet();

        var loyal = _customerService.GetAll()
            .Where(c => loyalIds.Contains(c.Id) && c.RegistrationDate <= cutoff)
            .ToList();

        return Ok(loyal);
    }

    /// <summary>POST /api/customer/register — Register a customer with a back-dated registration date</summary>
    [HttpPost("register")]
    public ActionResult<Customer> RegisterCustomer([FromBody] RegisterCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Name is required." });
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { error = "Email is required." });

        var customer = _customerService.Add(request.Name, request.Email, request.RegistrationDate);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }
}

