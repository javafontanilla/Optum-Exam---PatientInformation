using Microsoft.Extensions.Configuration;
using System.Data.Common;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Newtonsoft.Json;

using Dapper;

namespace PatientInformationHelper.Commands
{
    public class Repository
    {

        private readonly string _connectionString;
        private readonly Logs _log;

        public Repository(IConfiguration configuration, Logs log)
        {
            _connectionString = configuration.GetConnectionString("DefaultDataContext");
            _log = log;
        }

        public void Dispose()
        {
        }

        public async Task<T> InsertAsync<T>(string sp, DynamicParameters parms)
        {
            _log.Log($"Repository - InsertAsync - SP:{sp}");
            T result;

            using SqlConnection con = new SqlConnection(_connectionString);

            if (con.State == ConnectionState.Closed)
                con.Open();

            using var tran = con.BeginTransaction();

            try
            {
                result = await con.QueryFirstOrDefaultAsync<T>(sp, parms, commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
            }
            catch (Exception ex)
            {
                _log.LogError($"Repository - InsertAsync - SP:{sp} - Error:{ex.Message}");
                tran.Rollback();
                throw new Exception(ex.Message);
            }

            return result;
        }

        public int Execute(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            _log.Log($"Repository - Execute - SP:{sp}");
            using IDbConnection db = new SqlConnection(_connectionString);
            return db.Execute(sp, parms, commandType: commandType);
        }

        public T Get<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            try
            {
                _log.Log($"Repository - GET - SP:{sp}");
                using IDbConnection db = new SqlConnection(_connectionString);
                var result = db.Query<T>(sp, parms, commandType: commandType);
                return result.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _log.LogError($"Repository - GET - SP:{sp} - Error:{ex.Message}");
                throw new Exception(ex.Message);
            }
        }

        public async Task<IList<TList>> GetAll<TList>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            try
            {
                _log.Log($"Repository - GetAll - SP:{sp}");
                using IDbConnection db = new SqlConnection(_connectionString);
                var result = await db.QueryAsync<TList>(sp, parms, commandType: commandType);
                return result.ToList();
            }
            catch (Exception ex)
            {
                _log.LogError($"Repository - GetAll - SP:{sp} - Error:{ex.Message}");
                throw new Exception(ex.Message);
            }
        }

        public DbConnection GetDbconnection()
        {
            return new SqlConnection(_connectionString);
        }

        public T Insert<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            _log.Log($"Repository - Insert - SP:{sp}");
            T result;
            using IDbConnection db = new SqlConnection(_connectionString);
            try
            {
                if (db.State == ConnectionState.Closed)
                    db.Open();

                using var tran = db.BeginTransaction();
                try
                {
                    result = db.Query<T>(sp, parms, commandType: commandType, transaction: tran).FirstOrDefault();
                    tran.Commit();
                }
                catch (Exception ex)
                {
                    _log.LogError($"Repository - Insert - SP:{sp} - Error:{ex.Message}");
                    tran.Rollback();
                    throw ex;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (db.State == ConnectionState.Open)
                    db.Close();
            }

            return result;
        }

        public T Update<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            _log.Log($"Repository - Update - SP:{sp}");
            T result;
            using IDbConnection db = new SqlConnection(_connectionString);
            try
            {
                if (db.State == ConnectionState.Closed)
                    db.Open();

                using var tran = db.BeginTransaction();
                try
                {
                    result = db.Query<T>(sp, parms, commandType: commandType, transaction: tran).FirstOrDefault();
                    tran.Commit();
                }
                catch (Exception ex)
                {
                    tran.Rollback();
                    throw ex;
                }
            }
            catch (Exception ex)
            {
                _log.LogError($"Repository - Update - SP:{sp} - Error:{ex.Message}");
                throw ex;
            }
            finally
            {
                if (db.State == ConnectionState.Open)
                    db.Close();
            }

            return result;
        }

        //public async Task<CustomModelResponse> UpdateAsync(string sp, DynamicParameters parameter)
        //{
        //    try
        //    {
        //        using (SqlConnection con = new SqlConnection(_connectionString))
        //        {
        //            var result = Convert.ToBoolean(await con.ExecuteAsync(sp, parameter, commandType: CommandType.StoredProcedure).ConfigureAwait(false));
        //            return new CustomModelResponse("Successfully Updated", 200, result, "");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return new CustomModelResponse(ex.Message, 500, false, "");
        //    }

        //}

        public async Task<IList<TModel>> GetJsonPathListAsync<TModel>(string sp, DynamicParameters parameters) where TModel : class
        {
            try
            {
                _log.Log($"Repository - GetJsonPathListAsyncpdate - SP:{sp}");
                using (var con = new SqlConnection(_connectionString))
                {
                    var result = (from row in await con.QueryAsync(sp, parameters, commandType: CommandType.StoredProcedure)
                                  select row as IDictionary<string, object>);

                    if (result is null || result.Count() is 0)
                    {
                        return Enumerable.Empty<TModel>().ToList();
                    }

                    var resultSet = new StringBuilder();

                    foreach (var product in result)
                    {
                        var render = new Dictionary<string, object>(product)
                                .Select(x => x.Value)
                                .SingleOrDefault()
                                .ToString();

                        resultSet.Append(render);
                    }

                    var renderList = resultSet.ToString();

                    var getModel = JsonConvert.DeserializeObject<List<TModel>>(renderList);

                    return getModel;
                }
            }
            catch (Exception ex)
            {
                _log.LogError($"Repository - GetJsonPathListAsync - SP:{sp} - Error:{ex.Message}");
                throw new Exception(ex.Message);
            }
        }
    }
}
