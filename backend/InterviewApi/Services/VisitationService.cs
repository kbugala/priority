using System.Text.Json;
using InterviewApi.Models;

namespace InterviewApi.Services;

public class VisitationService : IVisitationService
{
    private readonly List<Visitation> _visitations;
    private readonly object _lock = new();
    private int _nextId;

    public VisitationService(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.ContentRootPath, "Data", "visitations.json");
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        try
        {
            var json = File.ReadAllText(path);
            _visitations = JsonSerializer.Deserialize<VisitationData>(json, options)?.Visitations ?? new();
        }
        catch { _visitations = new(); }

        _nextId = _visitations.Count > 0 ? _visitations.Max(v => v.Id) + 1 : 1;
    }

    public List<Visitation> GetAll()
    {
        lock (_lock) return _visitations.ToList();
    }

    public List<Visitation> GetFiltered(IEnumerable<int>? hotelIds, int? month, int? year)
    {
        lock (_lock)
        {
            IEnumerable<Visitation> query = _visitations;
            if (hotelIds?.Any() == true)
                query = query.Where(v => hotelIds.Contains(v.HotelId));
            if (month.HasValue)
                query = query.Where(v => v.VisitDate.Month == month.Value);
            if (year.HasValue)
                query = query.Where(v => v.VisitDate.Year == year.Value);
            return query.OrderBy(v => v.VisitDate).ToList();
        }
    }

    public Visitation Add(int customerId, int hotelId, DateTime visitDate)
    {
        lock (_lock)
        {
            var visitation = new Visitation
            {
                Id = _nextId++,
                CustomerId = customerId,
                HotelId = hotelId,
                VisitDate = DateTime.SpecifyKind(visitDate, DateTimeKind.Utc)
            };
            _visitations.Add(visitation);
            return visitation;
        }
    }
}
