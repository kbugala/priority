using InterviewApi.Models;

namespace InterviewApi.Services;

public interface IHotelService
{
    Hotel? GetById(int id);
    List<Hotel> GetAll();
}
