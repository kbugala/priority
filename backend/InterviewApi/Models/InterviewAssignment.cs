namespace InterviewApi.Models;

public class InterviewAssignment
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public int TotalPurchases { get; set; }
}

public class CustomerData
{
    public List<Customer> Customers { get; set; } = new();
}

public class Hotel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class HotelData
{
    public List<Hotel> Hotels { get; set; } = new();
}

public class Visitation
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int HotelId { get; set; }
    public DateTime VisitDate { get; set; }
}

public class VisitationData
{
    public List<Visitation> Visitations { get; set; } = new();
}

// Request DTOs
public class CreateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class RegisterCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime? RegistrationDate { get; set; }
}

public class RegisterVisitRequest
{
    public int CustomerId { get; set; }
    public int HotelId { get; set; }
    public DateTime VisitDate { get; set; }
}

// Response DTOs
public class VisitationResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public DateTime VisitDate { get; set; }
}

