using Microsoft.AspNetCore.Mvc;
using InterviewApi.Services;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelController : ControllerBase
{
    private readonly IHotelService _hotelService;

    public HotelController(IHotelService hotelService) => _hotelService = hotelService;

    [HttpGet]
    public ActionResult GetAll() => Ok(_hotelService.GetAll());

    [HttpGet("{id:int}")]
    public ActionResult GetById(int id)
    {
        var hotel = _hotelService.GetById(id);
        if (hotel is null) return NotFound(new { error = $"Hotel {id} not found." });
        return Ok(hotel);
    }
}
