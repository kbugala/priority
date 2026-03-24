using InterviewApi.Models;

namespace InterviewApi.Services;

public interface ICustomerService
{
    Customer? GetById(int id);
    List<Customer> GetAll();
    Customer Add(string name, string email, DateTime? registrationDate = null);
    List<int> GetLoyalCustomerIds(IEnumerable<Visitation> visitations, DateTime? asOfDate = null);
}
