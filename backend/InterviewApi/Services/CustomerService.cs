using System.Text.Json;
using InterviewApi.Models;

namespace InterviewApi.Services;

public class CustomerService : ICustomerService
{
    private readonly string _dataPath;
    private readonly object _lock = new();

    private static readonly JsonSerializerOptions ReadOptions = new() { PropertyNameCaseInsensitive = true };
    private static readonly JsonSerializerOptions WriteOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    public CustomerService(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "customers.json");
    }

    public Customer? GetById(int id)
    {
        lock (_lock) return ReadFromFile().FirstOrDefault(c => c.Id == id);
    }

    public List<Customer> GetAll()
    {
        lock (_lock) return ReadFromFile();
    }

    public Customer Add(string name, string email, DateTime? registrationDate = null)
    {
        lock (_lock)
        {
            var customers = ReadFromFile();
            var newId = customers.Count == 0 ? 1 : customers.Max(c => c.Id) + 1;
            var customer = new Customer
            {
                Id = newId,
                Name = name.Trim(),
                Email = email.Trim().ToLowerInvariant(),
                RegistrationDate = registrationDate.HasValue
                    ? DateTime.SpecifyKind(registrationDate.Value, DateTimeKind.Utc)
                    : DateTime.UtcNow,
                TotalPurchases = 0
            };
            customers.Add(customer);
            WriteToFile(customers);
            return customer;
        }
    }

    /// <summary>
    /// Loyal = visits the same hotel on the same weekday for every occurrence of that weekday in a calendar month.
    /// E.g. every Sunday in January at the Grand Hotel.
    /// </summary>
    public List<int> GetLoyalCustomerIds(IEnumerable<Visitation> visitations, DateTime? asOfDate = null)
    {
        var cutoff = asOfDate ?? DateTime.UtcNow;
        var filtered = visitations.Where(v => v.VisitDate <= cutoff).ToList();
        var loyalIds = new HashSet<int>();

        var groups = filtered.GroupBy(v => new
        {
            v.CustomerId,
            v.HotelId,
            v.VisitDate.Year,
            v.VisitDate.Month,
            v.VisitDate.DayOfWeek
        });

        foreach (var group in groups)
        {
            int year = group.Key.Year, month = group.Key.Month;
            var dow = group.Key.DayOfWeek;
            int daysInMonth = DateTime.DaysInMonth(year, month);

            // All dates in this month that fall on the target weekday
            var allOccurrences = Enumerable.Range(1, daysInMonth)
                .Select(d => new DateTime(year, month, d))
                .Where(d => d.DayOfWeek == dow)
                .ToHashSet();

            var visitedDates = group.Select(v => v.VisitDate.Date).ToHashSet();

            // Customer is loyal if they visited on ALL occurrences of the weekday
            if (allOccurrences.IsSubsetOf(visitedDates))
                loyalIds.Add(group.Key.CustomerId);
        }

        return loyalIds.ToList();
    }

    private List<Customer> ReadFromFile()
    {
        if (!File.Exists(_dataPath)) return new();
        try
        {
            var json = File.ReadAllText(_dataPath);
            return JsonSerializer.Deserialize<CustomerData>(json, ReadOptions)?.Customers ?? new();
        }
        catch { return new(); }
    }

    private void WriteToFile(List<Customer> customers)
    {
        var data = new CustomerData { Customers = customers };
        File.WriteAllText(_dataPath, JsonSerializer.Serialize(data, WriteOptions));
    }
}
