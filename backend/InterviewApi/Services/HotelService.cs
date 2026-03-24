using System.Text.Json;
using InterviewApi.Models;

namespace InterviewApi.Services;

public class HotelService : IHotelService
{
    private readonly List<Hotel> _hotels;

    public HotelService(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.ContentRootPath, "Data", "hotels.json");
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        try
        {
            var json = File.ReadAllText(path);
            _hotels = JsonSerializer.Deserialize<HotelData>(json, options)?.Hotels ?? new();
        }
        catch { _hotels = new(); }
    }

    public Hotel? GetById(int id) => _hotels.FirstOrDefault(h => h.Id == id);
    public List<Hotel> GetAll() => _hotels.ToList();
}
